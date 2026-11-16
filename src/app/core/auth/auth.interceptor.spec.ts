import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { Loading } from '../../shared/services/loading';

describe('authInterceptor (US-031 / T-031.2)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let currentToken: string | null = null;
  let finishSpy: ReturnType<typeof vi.fn>;
  let showSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    currentToken = null;
    finishSpy = vi.fn();
    showSpy = vi.fn(() => finishSpy);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            getToken: () => currentToken,
          },
        },
        {
          provide: Loading,
          useValue: {
            show: showSpy,
          },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('injeta o token JWT no header Authorization: Bearer <token> quando autenticado', () => {
    currentToken = 'jwt-token-valido-123';

    http.get('/api/v1/Clientes').subscribe();

    const req = httpMock.expectOne('/api/v1/Clientes');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token-valido-123');
    expect(showSpy).toHaveBeenCalledTimes(1);
    expect(finishSpy).not.toHaveBeenCalled();

    req.flush([]);
    expect(finishSpy).toHaveBeenCalledTimes(1);
  });

  it('não adiciona o header Authorization quando não há token disponível', () => {
    currentToken = null;

    http.get('/api/v1/Clientes').subscribe();

    const req = httpMock.expectOne('/api/v1/Clientes');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
    expect(finishSpy).toHaveBeenCalledTimes(1);
  });
});
