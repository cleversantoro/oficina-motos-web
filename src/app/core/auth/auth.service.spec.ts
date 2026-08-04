import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { apiPaths } from '../services/api-paths';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('persists access and refresh token after login', () => {
    service.login({ email: 'admin@oficina.local', password: '123456' }).subscribe();

    const req = httpMock.expectOne(apiPaths.auth.login);
    expect(req.request.method).toBe('POST');

    req.flush({
      token: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: '2026-08-04T00:00:00.000Z',
      expiresAt: '2026-08-03T00:00:00.000Z',
      email: 'admin@oficina.local',
      name: 'Admin',
      role: 'Admin',
      userId: 1,
      login: 'admin',
      roles: ['Admin'],
      permissions: ['dashboard:visualizar'],
    });

    expect(localStorage.getItem('oficina_token')).toBe('access-token');
    expect(localStorage.getItem('oficina_refresh_token')).toBe('refresh-token');
    expect(localStorage.getItem('oficina_user')).not.toBeNull();
  });

  it('refreshes the session using the persisted refresh token', () => {
    localStorage.setItem('oficina_refresh_token', 'refresh-token');

    service.refreshToken().subscribe();

    const req = httpMock.expectOne(apiPaths.auth.refresh);
    expect(req.request.method).toBe('POST');

    req.flush({
      token: 'renewed-token',
      refreshToken: 'new-refresh-token',
      refreshTokenExpiresAt: '2026-08-04T00:00:00.000Z',
      expiresAt: '2026-08-03T00:00:00.000Z',
      email: 'admin@oficina.local',
      name: 'Admin',
      role: 'Admin',
      userId: 1,
      login: 'admin',
      roles: ['Admin'],
      permissions: ['dashboard:visualizar'],
    });

    expect(localStorage.getItem('oficina_token')).toBe('renewed-token');
    expect(localStorage.getItem('oficina_refresh_token')).toBe('new-refresh-token');
  });
});
