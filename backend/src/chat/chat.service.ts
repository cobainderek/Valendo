import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';

type ConvType = 'dm' | 'group';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private gateway: ChatGateway,
  ) {}

  // -------------------------------------------------------------------
  // Conversas
  // -------------------------------------------------------------------

  async listConversations(userId: bigint) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, tag: true, globalXp: true } },
              },
            },
            messages: {
              orderBy: { sentAt: 'desc' },
              take: 1,
              include: {
                author: { select: { id: true, name: true, tag: true } },
              },
            },
          },
        },
      },
    });

    // Contagem de mensagens não lidas por conversa
    const result = await Promise.all(
      memberships.map(async (m) => {
        const unread = await this.prisma.message.count({
          where: {
            conversationId: m.conversationId,
            authorId: { not: userId },
            ...(m.lastReadAt ? { sentAt: { gt: m.lastReadAt } } : {}),
          },
        });
        return this.serializeConversation(m.conversation, userId, {
          unread,
          lastMessage: m.conversation.messages[0] ?? null,
          myLastReadAt: m.lastReadAt,
        });
      }),
    );

    // Ordena por última mensagem desc (ou createdAt se sem mensagens)
    return result.sort((a, b) => {
      const ta = a.lastMessage?.sentAt ?? a.createdAt;
      const tb = b.lastMessage?.sentAt ?? b.createdAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
  }

  async getConversation(userId: bigint, conversationId: bigint) {
    await this.assertMember(userId, conversationId);
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, tag: true, globalXp: true } },
          },
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: {
            author: { select: { id: true, name: true, tag: true } },
          },
        },
      },
    });
    if (!conv) throw new NotFoundException('Conversa não encontrada.');

    const myMembership = conv.members.find((m) => m.userId === userId)!;
    return this.serializeConversation(conv, userId, {
      unread: 0,
      lastMessage: conv.messages[0] ?? null,
      myLastReadAt: myMembership.lastReadAt,
    });
  }

  /** Abre (ou recupera) DM 1:1 com outro user — só funciona se forem amigos. */
  async openDm(userId: bigint, otherUserId: bigint) {
    if (userId === otherUserId) {
      throw new BadRequestException('Você não pode abrir DM com você mesmo.');
    }

    const other = await this.prisma.user.findUnique({
      where: { id: otherUserId },
    });
    if (!other) throw new NotFoundException('Usuário não encontrado.');

    // Exige amizade (status accepted)
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId },
        ],
      },
    });
    if (!friendship) {
      throw new ForbiddenException(
        'Vocês precisam ser amigos pra abrir uma DM.',
      );
    }

    // DM já existente?
    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: 'dm',
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: otherUserId } } },
        ],
      },
    });
    if (existing) {
      return this.getConversation(userId, existing.id);
    }

    const created = await this.prisma.conversation.create({
      data: {
        type: 'dm',
        createdById: userId,
        members: {
          create: [
            { userId, role: 'member' },
            { userId: otherUserId, role: 'member' },
          ],
        },
      },
    });

    const full = await this.getConversation(userId, created.id);
    // Notifica o outro user que tem uma nova conversa aberta
    this.gateway.notifyUser(
      otherUserId.toString(),
      'chat:conversation-updated',
      full,
    );
    return full;
  }

  async createGroup(userId: bigint, name: string, memberIds: bigint[]) {
    const uniqueIds = Array.from(new Set(memberIds.filter((id) => id !== userId)));
    if (uniqueIds.length === 0) {
      throw new BadRequestException('Adicione pelo menos um outro usuário.');
    }

    // Todos têm que existir
    const found = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (found.length !== uniqueIds.length) {
      throw new BadRequestException('Um ou mais usuários não existem.');
    }

    const created = await this.prisma.conversation.create({
      data: {
        type: 'group',
        name,
        createdById: userId,
        members: {
          create: [
            { userId, role: 'admin' },
            ...uniqueIds.map((id) => ({ userId: id, role: 'member' })),
          ],
        },
      },
    });

    const full = await this.getConversation(userId, created.id);

    // Notifica todos os membros (exceto criador) que têm conversa nova
    for (const id of uniqueIds) {
      this.gateway.notifyUser(
        id.toString(),
        'chat:conversation-updated',
        full,
      );
    }
    return full;
  }

  async addMember(
    userId: bigint,
    conversationId: bigint,
    targetUserId: bigint,
  ) {
    const me = await this.assertMember(userId, conversationId);
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('Conversa não encontrada.');
    if (conv.type === 'dm') {
      throw new BadRequestException(
        'Não é possível adicionar membros em uma DM.',
      );
    }
    if (me.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas admins podem adicionar membros ao grupo.',
      );
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) throw new NotFoundException('Usuário alvo não encontrado.');

    const existing = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
    });
    if (existing) {
      throw new ConflictException('Este usuário já é membro do grupo.');
    }

    await this.prisma.conversationMember.create({
      data: { conversationId, userId: targetUserId, role: 'member' },
    });

    const full = await this.getConversation(userId, conversationId);
    // Avisa todos os membros (inclusive o novo) que a conversa mudou
    this.broadcastConversationUpdate(conversationId, full);
    return full;
  }

  async removeMember(
    userId: bigint,
    conversationId: bigint,
    targetUserId: bigint,
  ) {
    const me = await this.assertMember(userId, conversationId);
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException('Conversa não encontrada.');
    if (conv.type === 'dm') {
      throw new BadRequestException('Não é possível remover membros de uma DM.');
    }

    // Self-remove sempre permitido; remoção de outro só admin
    if (targetUserId !== userId && me.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas admins podem remover outros membros.',
      );
    }

    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
    });
    if (!member) throw new NotFoundException('Membro não encontrado no grupo.');

    await this.prisma.conversationMember.delete({ where: { id: member.id } });

    // Se o grupo ficou vazio, deletar a conversa
    const remaining = await this.prisma.conversationMember.count({
      where: { conversationId },
    });
    if (remaining === 0) {
      await this.prisma.conversation.delete({ where: { id: conversationId } });
      return { ok: true, status: 'group-deleted' as const };
    }

    const full = await this.getConversation(
      remaining > 0 ? (await this.prisma.conversationMember.findFirst({
        where: { conversationId },
      }))!.userId : userId,
      conversationId,
    );
    this.broadcastConversationUpdate(conversationId, full);
    // Notifica também o removido pra ele tirar da lista local
    this.gateway.notifyUser(targetUserId.toString(), 'chat:removed-from', {
      conversationId: conversationId.toString(),
    });
    return { ok: true, status: 'removed' as const };
  }

  // -------------------------------------------------------------------
  // Mensagens
  // -------------------------------------------------------------------

  async listMessages(
    userId: bigint,
    conversationId: bigint,
    cursor: bigint | null,
    limit: number,
  ) {
    await this.assertMember(userId, conversationId);

    const items = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        author: { select: { id: true, name: true, tag: true } },
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasNext = items.length > limit;
    const slice = hasNext ? items.slice(0, limit) : items;

    return {
      items: slice.map((m) => this.serializeMessage(m)),
      nextCursor: hasNext ? slice[slice.length - 1].id.toString() : null,
    };
  }

  async sendMessage(
    userId: bigint,
    conversationId: bigint,
    text: string,
  ) {
    await this.assertMember(userId, conversationId);
    const trimmed = text.trim();
    if (!trimmed) throw new BadRequestException('Mensagem vazia.');

    const created = await this.prisma.message.create({
      data: { conversationId, authorId: userId, text: trimmed },
      include: { author: { select: { id: true, name: true, tag: true } } },
    });

    const payload = this.serializeMessage(created);

    // Atualiza lastReadAt do autor (autor leu sua própria mensagem)
    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: created.sentAt },
    });

    // Broadcast pra todos na sala da conversa
    this.gateway.emitToConversation(conversationId.toString(), 'chat:message', {
      conversationId: conversationId.toString(),
      message: payload,
    });

    return payload;
  }

  async markRead(
    userId: bigint,
    conversationId: bigint,
    lastMessageId: bigint,
  ) {
    await this.assertMember(userId, conversationId);

    const message = await this.prisma.message.findUnique({
      where: { id: lastMessageId },
    });
    if (!message || message.conversationId !== conversationId) {
      throw new NotFoundException('Mensagem não pertence a esta conversa.');
    }

    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: message.sentAt },
    });

    // Broadcast leitura pros outros (UX de "visto às HH:MM")
    this.gateway.emitToConversation(conversationId.toString(), 'chat:read', {
      conversationId: conversationId.toString(),
      userId: userId.toString(),
      lastMessageId: lastMessageId.toString(),
    });

    return { ok: true };
  }

  // -------------------------------------------------------------------
  // Utilitários públicos (consumidos pelo gateway)
  // -------------------------------------------------------------------

  /** Verifica se userId é membro da conversa — usado pelo gateway antes de socket.join. */
  async isMember(userId: bigint, conversationId: bigint): Promise<boolean> {
    const m = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    return !!m;
  }

  // -------------------------------------------------------------------
  // Helpers privados
  // -------------------------------------------------------------------

  private async assertMember(userId: bigint, conversationId: bigint) {
    const m = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!m) {
      throw new ForbiddenException('Você não participa desta conversa.');
    }
    return m;
  }

  private serializeMessage(m: any) {
    return {
      id: m.id.toString(),
      conversationId: m.conversationId.toString(),
      authorId: m.authorId.toString(),
      author: {
        id: m.author.id.toString(),
        name: m.author.name,
        tag: m.author.tag,
      },
      text: m.text,
      sentAt: m.sentAt,
      editedAt: m.editedAt,
    };
  }

  private serializeConversation(
    conv: any,
    currentUserId: bigint,
    extras: { unread: number; lastMessage: any | null; myLastReadAt: Date | null },
  ) {
    const members = conv.members.map((cm: any) => ({
      id: cm.user.id.toString(),
      name: cm.user.name,
      tag: cm.user.tag,
      globalXp: cm.user.globalXp,
      role: cm.role,
      joinedAt: cm.joinedAt,
      lastReadAt: cm.lastReadAt,
    }));

    let title = conv.name as string | null;
    if (conv.type === 'dm') {
      const other = conv.members.find(
        (cm: any) => cm.userId !== currentUserId,
      );
      title = other ? other.user.name : '(você mesmo)';
    }

    return {
      id: conv.id.toString(),
      type: conv.type as ConvType,
      title,
      name: conv.name,
      createdById: conv.createdById ? conv.createdById.toString() : null,
      createdAt: conv.createdAt,
      members,
      lastMessage: extras.lastMessage
        ? this.serializeMessage(extras.lastMessage)
        : null,
      unread: extras.unread,
      myLastReadAt: extras.myLastReadAt,
    };
  }

  /** Emite chat:conversation-updated pra todos os membros (DM + grupo). */
  private async broadcastConversationUpdate(
    conversationId: bigint,
    payload: any,
  ) {
    const members = await this.prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    for (const m of members) {
      this.gateway.notifyUser(
        m.userId.toString(),
        'chat:conversation-updated',
        payload,
      );
    }
  }
}
