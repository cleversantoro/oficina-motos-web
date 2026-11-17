import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SegurancaService } from '../../../../core/services/seguranca.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { UsuarioListaComponent } from './usuario-lista';

describe('UsuarioListaComponent', () => {
  let fixture: ComponentFixture<UsuarioListaComponent>;
  let component: UsuarioListaComponent;
  let segurancaMock: {
    listarUsuarios: ReturnType<typeof vi.fn>;
    excluirUsuario: ReturnType<typeof vi.fn>;
  };
  let confirmDeleteMock: ReturnType<typeof vi.fn>;
  let toastSuccessMock: ReturnType<typeof vi.fn>;

  const mockUsuarios = [
    {
      id: 1,
      nome: 'Administrador Sistema',
      login: 'admin',
      email: 'admin@oficina.com',
      status: 1,
      statusDescricao: 'Ativo',
      perfis: 'Administrador',
      ultimoLogin: null,
    },
    {
      id: 2,
      nome: 'Carlos Mecânico',
      login: 'carlos',
      email: 'carlos@oficina.com',
      status: 1,
      statusDescricao: 'Ativo',
      perfis: 'Mecânico',
      ultimoLogin: null,
    },
  ];

  beforeEach(async () => {
    segurancaMock = {
      listarUsuarios: vi.fn().mockReturnValue(of(mockUsuarios)),
      excluirUsuario: vi.fn().mockReturnValue(of(null)),
    };
    confirmDeleteMock = vi.fn().mockResolvedValue(true);
    toastSuccessMock = vi.fn();

    await TestBed.configureTestingModule({
      imports: [UsuarioListaComponent],
      providers: [
        provideRouter([]),
        { provide: SegurancaService, useValue: segurancaMock },
        { provide: Confirmation, useValue: { confirmDelete: confirmDeleteMock } },
        { provide: Toast, useValue: { success: toastSuccessMock, error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar e exibir a lista de usuários', () => {
    expect(segurancaMock.listarUsuarios).toHaveBeenCalledTimes(1);
    expect(component.usuarios().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Administrador Sistema');
    expect(fixture.nativeElement.textContent).toContain('Carlos Mecânico');
  });

  it('deve filtrar usuários pelo termo de busca', () => {
    component.busca.set('carlos');
    expect(component.usuariosFiltrados().length).toBe(1);
    expect(component.usuariosFiltrados()[0].login).toBe('carlos');
  });

  it('deve excluir usuário após confirmação', async () => {
    await component.confirmarExclusao(mockUsuarios[1]);
    expect(confirmDeleteMock).toHaveBeenCalledWith('Carlos Mecânico');
    expect(segurancaMock.excluirUsuario).toHaveBeenCalledWith(2);
    expect(component.usuarios().length).toBe(1);
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it('deve exibir erro quando listarUsuarios falhar', () => {
    segurancaMock.listarUsuarios.mockReturnValueOnce(throwError(() => new Error('500')));
    component.carregarUsuarios();
    expect(component.error()).toBe('Não foi possível carregar a lista de usuários.');
  });
});
