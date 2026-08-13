import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { canPerformPermission } from './rbac-access.helper';
import { Toast } from '../../shared/services/toast';

const ACCESS_DENIED_MESSAGE = 'Você não tem permissão para acessar esta área.';

export const ordensPermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(Toast);
  const action = route.data['ordensAction'] === 'criar' ? 'criar' : 'visualizar';

  if (canPerformPermission(authService.permissions(), 'ordens', action, authService.currentRole())) {
    return true;
  }

  toast.warn('Acesso negado', ACCESS_DENIED_MESSAGE);
  return router.createUrlTree(['/dashboard']);
};
