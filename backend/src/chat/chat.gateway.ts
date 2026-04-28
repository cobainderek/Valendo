import { Inject, forwardRef, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface AuthSocket extends Socket {
  data: { userId?: string; tag?: string };
}

const CONV_PREFIX = 'conv:';
const USER_PREFIX = 'user:';

@WebSocketGateway({
  // Mesmo path do RoomsGateway, mas namespace separado pra isolar.
  // Cliente conecta em: io('https://dyotech.shop/chat', { path: '/api/socket.io' })
  namespace: '/chat',
  path: '/api/socket.io',
  cors: {
    origin: (process.env.CORS_ORIGINS ??
      'https://dyotech.shop,https://www.dyotech.shop,http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    server.use((socket: AuthSocket, next) => {
      const token =
        socket.handshake.auth?.token ||
        (typeof socket.handshake.headers?.authorization === 'string'
          ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
          : undefined);
      if (!token) return next(new Error('Token JWT ausente'));
      try {
        const payload: any = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'sua-chave-secreta-aqui',
        });
        socket.data.userId = String(payload.sub);
        socket.data.tag = payload.tag;
        next();
      } catch {
        next(new Error('Token JWT inválido ou expirado'));
      }
    });
  }

  handleConnection(socket: AuthSocket) {
    if (!socket.data.userId) return socket.disconnect();
    // Toda mensagem direcionada a este user (notificações de amizade, novas DMs, etc)
    socket.join(USER_PREFIX + socket.data.userId);
    this.logger.log(
      `chat WS connect: user=${socket.data.userId} sid=${socket.id}`,
    );
  }

  handleDisconnect(socket: AuthSocket) {
    this.logger.log(`chat WS disconnect: sid=${socket.id}`);
  }

  // ===== Cliente → Servidor =====

  @SubscribeMessage('chat:join')
  async onJoin(
    @MessageBody() body: { conversationId: string },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const convId = String(body?.conversationId ?? '');
    if (!convId) return { ok: false, error: 'conversationId obrigatório' };

    let parsed: bigint;
    try {
      parsed = BigInt(convId);
    } catch {
      return { ok: false, error: 'conversationId inválido' };
    }

    const member = await this.chatService.isMember(
      BigInt(socket.data.userId!),
      parsed,
    );
    if (!member) {
      socket.emit('chat:error', { message: 'Você não participa desta conversa.' });
      return { ok: false, error: 'forbidden' };
    }

    socket.join(CONV_PREFIX + convId);
    return { ok: true };
  }

  @SubscribeMessage('chat:leave')
  onLeave(
    @MessageBody() body: { conversationId: string },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const convId = String(body?.conversationId ?? '');
    if (convId) socket.leave(CONV_PREFIX + convId);
    return { ok: true };
  }

  /** Indicador "fulano está digitando…" — efêmero, não persiste. */
  @SubscribeMessage('chat:typing')
  onTyping(
    @MessageBody() body: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const convId = String(body?.conversationId ?? '');
    if (!convId) return { ok: false };
    const userId = socket.data.userId!;
    // Broadcast pra todo mundo na sala (exceto remetente)
    socket
      .to(CONV_PREFIX + convId)
      .emit('chat:typing', {
        conversationId: convId,
        userId,
        isTyping: !!body.isTyping,
      });
    return { ok: true };
  }

  // ===== Métodos chamados pelos services =====

  /** Notifica um único user (todos os sockets dele em todas as abas/dispositivos). */
  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(USER_PREFIX + userId).emit(event, payload);
  }

  /** Emite pra todo mundo conectado naquela conversa. */
  emitToConversation(conversationId: string, event: string, payload: any) {
    this.server.to(CONV_PREFIX + conversationId).emit(event, payload);
  }
}
