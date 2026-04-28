import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

type Status = 'pending' | 'accepted' | 'rejected';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  /** Procura users por tag (prefix match) — pra UI de "adicionar amigo". */
  async searchByTag(currentUserId: bigint, q: string, limit: number) {
    const tag = q.trim();
    if (!tag) return [];
    const users = await this.prisma.user.findMany({
      where: {
        tag: { startsWith: tag, mode: 'insensitive' },
        id: { not: currentUserId },
      },
      select: { id: true, name: true, tag: true, globalXp: true },
      take: Math.min(limit, 20),
      orderBy: { tag: 'asc' },
    });
    return users.map((u) => ({ ...u, id: u.id.toString() }));
  }

  /** Envia pedido. Idempotente: se o destinatário já te mandou pedido, aceita. */
  async sendRequest(requesterId: bigint, addresseeTag: string) {
    const addressee = await this.prisma.user.findUnique({
      where: { tag: addresseeTag },
    });
    if (!addressee) throw new NotFoundException('Usuário não encontrado.');
    if (addressee.id === requesterId) {
      throw new BadRequestException(
        'Você não pode mandar pedido pra si mesmo.',
      );
    }

    // Já existe pedido nesse sentido?
    const existing = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId,
          addresseeId: addressee.id,
        },
      },
    });
    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictException('Vocês já são amigos.');
      }
      if (existing.status === 'pending') {
        throw new ConflictException('Pedido já enviado.');
      }
      // rejected → permitir reenviar atualizando a row
      const updated = await this.prisma.friendship.update({
        where: { id: existing.id },
        data: { status: 'pending', createdAt: new Date(), respondedAt: null },
      });
      this.notifyRequestReceived(updated.id, requesterId, addressee.id);
      return this.serialize(updated);
    }

    // Pedido inverso já existe (eles te mandaram)? → aceita automaticamente
    const inverse = await this.prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: addressee.id,
          addresseeId: requesterId,
        },
      },
    });
    if (inverse && inverse.status === 'pending') {
      const accepted = await this.prisma.friendship.update({
        where: { id: inverse.id },
        data: { status: 'accepted', respondedAt: new Date() },
      });
      this.notifyRequestAccepted(accepted.id, addressee.id, requesterId);
      return this.serialize(accepted);
    }

    const created = await this.prisma.friendship.create({
      data: { requesterId, addresseeId: addressee.id, status: 'pending' },
    });
    this.notifyRequestReceived(created.id, requesterId, addressee.id);
    return this.serialize(created);
  }

  /** Lista pedidos pendentes recebidos (alguém me mandou e ainda não respondi). */
  async listIncoming(userId: bigint) {
    const items = await this.prisma.friendship.findMany({
      where: { addresseeId: userId, status: 'pending' },
      include: {
        requester: { select: { id: true, name: true, tag: true, globalXp: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((f) => ({
      id: f.id.toString(),
      createdAt: f.createdAt,
      from: { ...f.requester, id: f.requester.id.toString() },
    }));
  }

  /** Lista pedidos pendentes enviados (eu mandei e estou esperando). */
  async listOutgoing(userId: bigint) {
    const items = await this.prisma.friendship.findMany({
      where: { requesterId: userId, status: 'pending' },
      include: {
        addressee: { select: { id: true, name: true, tag: true, globalXp: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((f) => ({
      id: f.id.toString(),
      createdAt: f.createdAt,
      to: { ...f.addressee, id: f.addressee.id.toString() },
    }));
  }

  /** Lista amigos (status accepted), agnóstico de quem mandou o pedido. */
  async listFriends(userId: bigint) {
    const items = await this.prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, tag: true, globalXp: true } },
        addressee: { select: { id: true, name: true, tag: true, globalXp: true } },
      },
      orderBy: { respondedAt: 'desc' },
    });

    return items.map((f) => {
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      return {
        friendshipId: f.id.toString(),
        since: f.respondedAt,
        ...friend,
        id: friend.id.toString(),
      };
    });
  }

  async respondToRequest(
    userId: bigint,
    requestId: bigint,
    accept: boolean,
  ) {
    const req = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });
    if (!req) throw new NotFoundException('Pedido não encontrado.');
    if (req.addresseeId !== userId) {
      throw new ForbiddenException(
        'Apenas o destinatário pode responder a este pedido.',
      );
    }
    if (req.status !== 'pending') {
      throw new BadRequestException('Este pedido já foi respondido.');
    }

    const updated = await this.prisma.friendship.update({
      where: { id: requestId },
      data: {
        status: accept ? 'accepted' : 'rejected',
        respondedAt: new Date(),
      },
    });

    if (accept) {
      this.notifyRequestAccepted(updated.id, req.addresseeId, req.requesterId);
    }

    return this.serialize(updated);
  }

  /** Remove amizade existente OU pedido pendente que eu mandei. */
  async removeFriend(userId: bigint, otherUserId: bigint) {
    if (userId === otherUserId) {
      throw new BadRequestException('Operação inválida.');
    }
    const f = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId },
        ],
      },
    });
    if (!f) throw new NotFoundException('Vocês não estão conectados.');
    await this.prisma.friendship.delete({ where: { id: f.id } });
    return { ok: true };
  }

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  private serialize(f: { id: bigint; requesterId: bigint; addresseeId: bigint; status: string; createdAt: Date; respondedAt: Date | null }) {
    return {
      id: f.id.toString(),
      requesterId: f.requesterId.toString(),
      addresseeId: f.addresseeId.toString(),
      status: f.status as Status,
      createdAt: f.createdAt,
      respondedAt: f.respondedAt,
    };
  }

  private async notifyRequestReceived(
    friendshipId: bigint,
    requesterId: bigint,
    addresseeId: bigint,
  ) {
    try {
      const requester = await this.prisma.user.findUnique({
        where: { id: requesterId },
        select: { id: true, name: true, tag: true, globalXp: true },
      });
      if (!requester) return;
      this.chatGateway.notifyUser(addresseeId.toString(), 'friend:request-received', {
        id: friendshipId.toString(),
        from: { ...requester, id: requester.id.toString() },
      });
    } catch {
      // gateway opcional — não falhar o request
    }
  }

  private async notifyRequestAccepted(
    friendshipId: bigint,
    accepterId: bigint,
    requesterId: bigint,
  ) {
    try {
      const accepter = await this.prisma.user.findUnique({
        where: { id: accepterId },
        select: { id: true, name: true, tag: true, globalXp: true },
      });
      if (!accepter) return;
      this.chatGateway.notifyUser(requesterId.toString(), 'friend:request-accepted', {
        id: friendshipId.toString(),
        by: { ...accepter, id: accepter.id.toString() },
      });
    } catch {
      // ignore
    }
  }
}
