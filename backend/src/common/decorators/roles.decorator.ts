import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Uso: @Roles('admin') ou @Roles('admin', 'moderator')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
