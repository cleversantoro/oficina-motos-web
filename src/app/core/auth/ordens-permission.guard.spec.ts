import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ordensPermissionGuard } from './ordens-permission.guard';
import { Toast } from '../../shared/services/toast';

describe('ordensPermissionGuard', () => {
  const route = (action: 'visualizar' | 'criar') => ({
    data: { ordensAction: action },
  }) as unknown as ActivatedRouteSnapshot;

  function configure(permissions: string[]) {
    const redirect = ['/dashboard'];
    const warnings: string[] = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { permissions: () => permissions } },
        { provide: Router, useValue: { createUrlTree: () => redirect } },
        { provide: Toast, useValue: { warn: (_summary: string, detail: string) => warnings.push(detail) } },
      ],
    });
    return { redirect, warnings };
  }

  it('permite uma sessão com a permissão de consulta', () => {
    configure(['ordens:visualizar']);

    const result = TestBed.runInInjectionContext(() =>
      ordensPermissionGuard(route('visualizar'), {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redireciona uma sessão sem a permissão de criação', () => {
    const { redirect, warnings } = configure(['ordens:visualizar']);

    const result = TestBed.runInInjectionContext(() =>
      ordensPermissionGuard(route('criar'), {} as RouterStateSnapshot),
    );

    expect(result).toEqual(redirect);
    expect(warnings).toEqual(['Você não tem permissão para acessar esta área.']);
  });
});
