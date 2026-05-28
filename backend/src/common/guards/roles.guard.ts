import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Combina com AuthGuard('jwt'): aplique sempre depois dele, ex:
//   @UseGuards(AuthGuard('jwt'), RolesGuard)
//   @Roles('admin')
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole: string | undefined = request.user?.role;

    if (!userRole) {
      throw new ForbiddenException('Acesso negado.');
    }

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    return true;
  }
}
