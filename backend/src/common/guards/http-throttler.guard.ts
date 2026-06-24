import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * ThrottlerGuard que só atua em requisições HTTP.
 *
 * Como APP_GUARD, o ThrottlerGuard padrão rodaria também nos handlers de
 * WebSocket (@SubscribeMessage dos gateways), onde NÃO há req/res HTTP — ao
 * tentar ler IP/headers numa conexão de socket ele quebraria os eventos de
 * realtime (sala/chat). Aqui pulamos qualquer contexto que não seja 'http'.
 */
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }
    return super.canActivate(context);
  }
}
