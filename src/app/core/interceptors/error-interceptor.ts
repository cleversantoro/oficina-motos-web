import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Toast } from '../../shared/services/toast';

/**
 * Interceptor funcional que trata erros HTTP de forma centralizada
 * - 401 Unauthorized → Redireciona para login (via AuthService.logout())
 * - 403 Forbidden → Exibe toast de erro de permissão
 * - 500 Internal Server Error → Exibe toast de erro do servidor
 * - Outros erros → Exibe mensagem genérica
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(Toast);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/api/v1/Auth/refresh')) {
        if (!authService.getRefreshToken()) {
          toast.error('Sessão expirada', 'Sua sessão expirou. Faça login novamente.');
          authService.logout();
          return throwError(() => error);
        }

        return authService.refreshToken().pipe(
          filter(() => !!authService.getToken()),
          take(1),
          switchMap(() => next(req.clone())),
          catchError(refreshError => {
            toast.error('Sessão expirada', 'Não foi possível renovar a sessão. Faça login novamente.');
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Verifica se é um erro HTTP
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            toast.error(
              'Sessão expirada',
              'Sua sessão expirou. Faça login novamente.'
            );
            authService.logout();
            break;
          case 403:
            // Proibido - sem permissão
            toast.error(
              'Acesso negado',
              'Você não tem permissão para acessar este recurso.'
            );
            break;
          case 404:
            // Não encontrado
            toast.warn(
              'Não encontrado',
              'O recurso solicitado não foi encontrado.'
            );
            break;
          case 500:
            // Erro interno do servidor
            toast.error(
              'Erro no servidor',
              'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'
            );
            break;
          case 502:
          case 503:
          case 504:
            // Erros de gateway/serviço indisponível
            toast.error(
              'Serviço indisponível',
              'O serviço está temporariamente indisponível. Tente novamente em alguns instantes.'
            );
            break;
          case 0:
            // Erro de conexão (sem resposta do servidor)
            toast.error(
              'Erro de conexão',
              'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
            );
            break;
          default:
            // Outros erros HTTP
            const errorMessage = error.error?.message || error.message || 'Erro desconhecido';
            toast.error(
              `Erro ${error.status}`,
              errorMessage
            );
        }
      } else {
        // Erro não HTTP (ex: erro de JavaScript)
        console.error('Erro não HTTP:', error);
        toast.error(
          'Erro inesperado',
          'Ocorreu um erro inesperado. Tente novamente.'
        );
      }

      // Propaga o erro para que chamadores possam tratá-lo se necessário
      return throwError(() => error);
    })
  );
};
