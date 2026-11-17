import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Toast } from '../../shared/services/toast';
import { AuthService } from './auth.service';
import { RoleGuard, roleGuard } from './role.guard';

describe('roleGuard / RoleGuard', () => {
  let currentRoleSignal: ReturnType<typeof signal<string | null>>;
  let warnSpy: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(() => {
    currentRoleSignal = signal<string | null>(null);
    warnSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentRole: currentRoleSignal.asReadonly(),
          },
        },
        {
          provide: Toast,
          useValue: {
            warn: warnSpy,
          },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  const runGuard = (data: Record<string, unknown> = {}) => {
    const route = { data } as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
  };

  it('deve exportar RoleGuard como alias de roleGuard', () => {
    expect(RoleGuard).toBe(roleGuard);
  });

  it('deve permitir acesso para role Administrador', () => {
    currentRoleSignal.set('Administrador');
    const result = runGuard();
    expect(result).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('deve permitir acesso para role Admin (case-insensitive)', () => {
    currentRoleSignal.set('admin');
    const result = runGuard({ roles: ['Admin'] });
    expect(result).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('deve bloquear acesso e redirecionar para /dashboard quando role for Gerente ou Mecânico', () => {
    currentRoleSignal.set('Gerente');
    const result = runGuard();
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
    expect(warnSpy).toHaveBeenCalledTimes(1);

    currentRoleSignal.set('Mecânico');
    const resultMecanico = runGuard();
    expect(resultMecanico instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(resultMecanico as UrlTree)).toBe('/dashboard');
  });

  it('deve bloquear acesso quando usuário não possuir role', () => {
    currentRoleSignal.set(null);
    const result = runGuard();
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
