import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { Toast } from '../../shared/services/toast';
import { errorInterceptor } from './error-interceptor';

describe('errorInterceptor (US-031 / T-031.3)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: {
    getRefreshToken: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let toastMock: {
    error: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorInterceptor(req, next));

  beforeEach(() => {
    authServiceMock = {
      getRefreshToken: vi.fn(() => null),
      getToken: vi.fn(() => null),
      refreshToken: vi.fn(),
      logout: vi.fn(),
    };

    toastMock = {
      error: vi.fn(),
      warn: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('expõe um interceptor funcional compatível com o Angular', () => {
    expect(typeof interceptor).toBe('function');
  });

  it('chama logout() e exibe toast quando uma requisição retorna 401 sem refresh token (T-031.3)', () => {
    authServiceMock.getRefreshToken.mockReturnValue(null);

    http.get('/api/v1/Clientes').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('/api/v1/Clientes');
    req.flush({ message: 'Não autorizado' }, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(toastMock.error).toHaveBeenCalledWith(
      'Sessão expirada',
      'Sua sessão expirou. Faça login novamente.'
    );
  });

  it('chama logout() quando 401 ocorre e a renovação de refresh token falha (T-031.3)', () => {
    authServiceMock.getRefreshToken.mockReturnValue('expired-refresh-token');
    authServiceMock.refreshToken.mockReturnValue(
      throwError(() => new Error('Refresh token expirado'))
    );

    http.get('/api/v1/Clientes').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('/api/v1/Clientes');
    req.flush({ message: 'Não autorizado' }, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refreshToken).toHaveBeenCalledTimes(1);
    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(toastMock.error).toHaveBeenCalledWith(
      'Sessão expirada',
      'Não foi possível renovar a sessão. Faça login novamente.'
    );
  });

  it('exibe toast de acesso negado em erro 403 sem chamar logout()', () => {
    http.get('/api/v1/Clientes').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('/api/v1/Clientes');
    req.flush({ message: 'Proibido' }, { status: 403, statusText: 'Forbidden' });

    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(toastMock.error).toHaveBeenCalledWith(
      'Acesso negado',
      'Você não tem permissão para acessar este recurso.'
    );
  });

  it('exibe toast de erro no servidor em erro 500', () => {
    http.get('/api/v1/Clientes').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('/api/v1/Clientes');
    req.flush({ message: 'Erro interno' }, { status: 500, statusText: 'Internal Server Error' });

    expect(toastMock.error).toHaveBeenCalledWith(
      'Erro no servidor',
      'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'
    );
  });
});
