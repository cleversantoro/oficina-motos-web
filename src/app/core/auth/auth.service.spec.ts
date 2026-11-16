import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { apiPaths } from '../services/api-paths';

describe('AuthService (US-030 / T-030.1)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('persists access and refresh token after login and updates currentUser signal and isAuthenticated()', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);

    service.login({ email: 'admin@oficina.local', password: '123456' }).subscribe();

    const req = httpMock.expectOne(request => request.url.endsWith(apiPaths.auth.login));
    expect(req.request.method).toBe('POST');

    req.flush({
      token: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: '2099-08-04T00:00:00.000Z',
      expiresAt: '2099-08-03T00:00:00.000Z',
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
    expect(JSON.parse(localStorage.getItem('oficina_user')!).permissions).toEqual(['dashboard:visualizar']);
    expect(service.currentUser()?.email).toBe('admin@oficina.local');
    expect(service.currentRole()).toBe('Admin');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears storage, resets currentUser signal to null, sets isAuthenticated() to false, and navigates to /login on logout()', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.login({ email: 'admin@oficina.local', password: '123456' }).subscribe();
    const loginReq = httpMock.expectOne(request => request.url.endsWith(apiPaths.auth.login));
    loginReq.flush({
      token: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: '2099-08-04T00:00:00.000Z',
      expiresAt: '2099-08-03T00:00:00.000Z',
      email: 'admin@oficina.local',
      name: 'Admin',
      role: 'Admin',
      userId: 1,
      login: 'admin',
      roles: ['Admin'],
      permissions: ['dashboard:visualizar'],
    });

    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    const logoutReq = httpMock.expectOne(request => request.url.endsWith(apiPaths.auth.logout));
    expect(logoutReq.request.method).toBe('POST');
    expect(logoutReq.request.body).toEqual({ refreshToken: 'refresh-token' });
    logoutReq.flush(null);

    expect(localStorage.getItem('oficina_token')).toBeNull();
    expect(localStorage.getItem('oficina_refresh_token')).toBeNull();
    expect(localStorage.getItem('oficina_user')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('refreshes the session using the persisted refresh token', () => {
    localStorage.setItem('oficina_refresh_token', 'refresh-token');

    service.refreshToken().subscribe();

    const req = httpMock.expectOne(request => request.url.endsWith(apiPaths.auth.refresh));
    expect(req.request.method).toBe('POST');

    req.flush({
      token: 'renewed-token',
      refreshToken: 'new-refresh-token',
      refreshTokenExpiresAt: '2099-08-04T00:00:00.000Z',
      expiresAt: '2099-08-03T00:00:00.000Z',
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
    expect(service.isAuthenticated()).toBe(true);
  });

  it('restores permissions and isAuthenticated() from a non-expired persisted session', () => {
    TestBed.resetTestingModule();
    localStorage.setItem(
      'oficina_user',
      JSON.stringify({
        email: 'admin@oficina.local',
        name: 'Admin',
        role: 'Admin',
        permissions: ['ordens:visualizar'],
        expiresAt: '2099-08-03T00:00:00.000Z',
      })
    );

    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule] });
    const restored = TestBed.inject(AuthService);

    expect(restored.permissions()).toEqual(['ordens:visualizar']);
    expect(restored.isAuthenticated()).toBe(true);
  });

  it('returns isAuthenticated() as false and clears storage when persisted session is expired', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('oficina_token', 'expired-token');
    localStorage.setItem(
      'oficina_user',
      JSON.stringify({
        email: 'admin@oficina.local',
        name: 'Admin',
        role: 'Admin',
        permissions: ['ordens:visualizar'],
        expiresAt: '2020-01-01T00:00:00.000Z',
      })
    );

    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule] });
    const restored = TestBed.inject(AuthService);

    expect(restored.currentUser()).toBeNull();
    expect(restored.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('oficina_token')).toBeNull();
  });
});
