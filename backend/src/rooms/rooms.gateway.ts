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
import { RoomsService } from './rooms.service';

interface AuthSocket extends Socket {
  data: {
    userId?: string; // string porque BigInt não serializa pra session
    tag?: string;
  };
}

const ROOM_PREFIX = 'room:';

@WebSocketGateway({
  // path alinhado com o global prefix /api do Nest e com o nginx (location /api/)
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
export class RoomsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(RoomsGateway.name);

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => RoomsService))
    private roomsService: RoomsService,
  ) {}

  // Middleware de auth: roda no handshake antes de conectar
  afterInit(server: Server) {
    server.use((socket: AuthSocket, next) => {
      const token =
        socket.handshake.auth?.token ||
        // fallback: header Authorization "Bearer xxx"
        (typeof socket.handshake.headers?.authorization === 'string'
          ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
          : undefined);

      if (!token) {
        return next(new Error('Token JWT ausente'));
      }

      try {
        const payload: any = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'sua-chave-secreta-aqui',
        });
        socket.data.userId = String(payload.sub);
        socket.data.tag = payload.tag;
        next();
      } catch (err) {
        next(new Error('Token JWT inválido ou expirado'));
      }
    });
  }

  handleConnection(socket: AuthSocket) {
    this.logger.log(
      `WS connect: user=${socket.data.userId} tag=${socket.data.tag} sid=${socket.id}`,
    );
  }

  handleDisconnect(socket: AuthSocket) {
    this.logger.log(`WS disconnect: sid=${socket.id}`);
  }

  // ===== Cliente → Servidor =====

  @SubscribeMessage('room:join')
  async onJoin(
    @MessageBody() body: { code: string },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const code = String(body?.code ?? '').toUpperCase();
    if (!code) return { ok: false, error: 'code obrigatório' };

    socket.join(ROOM_PREFIX + code);

    // Devolve estado completo só pra esse socket
    try {
      const state = await this.roomsService.getRoomByCode(code);
      socket.emit('room:state', state);
      return { ok: true };
    } catch (err: any) {
      socket.emit('room:error', {
        message: err?.message || 'Erro ao carregar sala',
      });
      return { ok: false, error: err?.message };
    }
  }

  @SubscribeMessage('room:leave')
  onLeaveRoom(
    @MessageBody() body: { code: string },
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const code = String(body?.code ?? '').toUpperCase();
    if (code) socket.leave(ROOM_PREFIX + code);
    return { ok: true };
  }

  // ===== Métodos utilitários chamados pelo RoomsService =====

  /** Emite estado completo da sala pra todo mundo conectado nela. */
  async broadcastRoomState(code: string) {
    try {
      const state = await this.roomsService.getRoomByCode(code);
      this.server.to(ROOM_PREFIX + code).emit('room:state', state);
    } catch (err: any) {
      this.logger.warn(
        `broadcastRoomState(${code}) falhou: ${err?.message ?? err}`,
      );
    }
  }

  emitPlayerJoined(code: string, payload: any) {
    this.server.to(ROOM_PREFIX + code).emit('room:player-joined', payload);
  }

  emitPlayerLeft(code: string, payload: { playerId: string }) {
    this.server.to(ROOM_PREFIX + code).emit('room:player-left', payload);
  }

  emitDuelStart(code: string, payload: { totalRounds: number }) {
    this.server.to(ROOM_PREFIX + code).emit('duel:start', payload);
  }

  emitQuestionResult(code: string, payload: any) {
    this.server.to(ROOM_PREFIX + code).emit('question:result', payload);
  }

  emitDuelFinished(code: string, payload: any) {
    this.server.to(ROOM_PREFIX + code).emit('duel:finished', payload);
  }

  emitRoomCancelled(code: string) {
    this.server.to(ROOM_PREFIX + code).emit('room:cancelled', { code });
  }
}
