import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Toast } from '../../shared/services/toast';
import { AuthService } from './auth.service';
import { hasAnyRole, normalizeRole } from './rbac-access.helper';

const DEFAULT_ADMIN_ROLES = ['Admin', 'Administrador'];
const ACCESS_DENIED_MESSAGE = 'Você não tem permissão de Administrador para acessar esta área.';

function expandRoleAliases(roles: string[]): string[] {
  const expanded = new Set<string>();
  for (const role of roles) {
    expanded.add(role);
    const normalized = normalizeRole(role);
    if (normalized === 'admin' || normalized === 'administrador') {
      expanded.add('Admin');
      expanded.add('Administrador');
    }
  }
  return Array.from(expanded);
}

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(Toast);

  const configuredRoles = route.data?.['roles'];
  const baseRoles = Array.isArray(configuredRoles) && configuredRoles.length > 0
    ? configuredRoles
    : DEFAULT_ADMIN_ROLES;
  const allowedRoles = expandRoleAliases(baseRoles);

  if (hasAnyRole(authService.currentRole(), allowedRoles)) {
    return true;
  }

  toast.warn('Acesso negado', ACCESS_DENIED_MESSAGE);
  return router.createUrlTree(['/dashboard']);
};

export const RoleGuard = roleGuard;
