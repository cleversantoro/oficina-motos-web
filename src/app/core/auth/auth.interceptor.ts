import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from './auth.service';
import { Loading } from '../../shared/services/loading';

/**
 * Interceptor funcional que adiciona o token JWT em todas as requisições
 * e gerencia o loading global durante as requisições HTTP.
 *
 * Nota: Tratamento de erros (incluindo 401) é feito pelo errorInterceptor.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loadingService = inject(Loading);
  const token = authService.getToken();

  // Inicia o loading e obtém a função de finalização
  const finishLoading = loadingService.show();

  const authorizedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    // Garante que o loading seja finalizado em qualquer cenário
    finalize(() => finishLoading())
  );
};
