import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CurrentUser } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { Toast } from '../../shared/services/toast';
import { AppHeader } from './header';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;
  let component: AppHeader;
  let router: Router;
  let currentUserSignal: ReturnType<typeof signal<CurrentUser | null>>;
  let currentRoleSignal: ReturnType<typeof signal<string | null>>;
  let permissionsSignal: ReturnType<typeof signal<string[]>>;
  let logoutMock: ReturnType<typeof vi.fn>;
  let toastMock: { warn: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    currentUserSignal = signal<CurrentUser | null>({
      email: 'admin@oficina.com',
      name: 'Carlos Silva',
      role: 'Administrador',
      permissions: ['ordens:criar'],
      expiresAt: new Date(Date.now() + 60_000),
    });
    currentRoleSignal = signal<string | null>('Administrador');
    permissionsSignal = signal<string[]>(['ordens:criar']);
    logoutMock = vi.fn();
    toastMock = { warn: vi.fn(), info: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AppHeader],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: currentUserSignal.asReadonly(),
            currentRole: currentRoleSignal.asReadonly(),
            permissions: permissionsSignal.asReadonly(),
            logout: logoutMock,
          },
        },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(AppHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve calcular iniciais do usuário e acionar logout', () => {
    expect(component.initials()).toBe('CS');
    component.logout();
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('deve navegar para /ordens com queryParam ao submeter busca global', () => {
    component.searchTerm.set('ABC1234');
    component.onSearch();
    expect(router.navigate).toHaveBeenCalledWith(['/ordens'], { queryParams: { q: 'ABC1234' } });
  });

  it('deve navegar para /ordens/novo ao clicar em Nova OS com permissão', () => {
    component.novaOrdem();
    expect(router.navigate).toHaveBeenCalledWith(['/ordens/novo']);
  });

  it('deve bloquear Nova OS e exibir toast quando usuário não tiver permissão', () => {
    currentRoleSignal.set('Consulta');
    permissionsSignal.set(['ordens:visualizar']);
    component.novaOrdem();
    expect(toastMock.warn).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalledWith(['/ordens/novo']);
  });

  it('deve recarregar rota atual e exibir toast ao sincronizar', async () => {
    component.sincronizar();
    await fixture.whenStable();
    expect(router.navigateByUrl).toHaveBeenCalled();
    expect(toastMock.info).toHaveBeenCalledWith('Sincronizado', 'Dados da tela atualizados.');
  });
});
