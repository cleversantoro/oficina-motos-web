import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SegurancaService } from '../../../../core/services/seguranca.service';
import { Toast } from '../../../../shared/services/toast';
import { PerfilListaComponent } from './perfil-lista';

describe('PerfilListaComponent', () => {
  let fixture: ComponentFixture<PerfilListaComponent>;
  let component: PerfilListaComponent;
  let segurancaMock: {
    listarPerfis: ReturnType<typeof vi.fn>;
    listarPermissoes: ReturnType<typeof vi.fn>;
    obterPerfil: ReturnType<typeof vi.fn>;
    atualizarPermissoesPerfil: ReturnType<typeof vi.fn>;
  };

  const mockPerfil = {
    id: 1,
    nome: 'Administrador',
    descricao: 'Acesso total',
    nivel: 1,
    status: 1,
    permissoes: [
      { id: 10, moduloId: 1, moduloNome: 'ordens', acao: 'visualizar', codigo: 'ordens:visualizar' },
    ],
  };

  const mockPermissoes = [
    { id: 10, moduloId: 1, moduloNome: 'ordens', acao: 'visualizar', codigo: 'ordens:visualizar' },
    { id: 11, moduloId: 1, moduloNome: 'ordens', acao: 'criar', codigo: 'ordens:criar' },
  ];

  beforeEach(async () => {
    segurancaMock = {
      listarPerfis: vi.fn().mockReturnValue(of([mockPerfil])),
      listarPermissoes: vi.fn().mockReturnValue(of(mockPermissoes)),
      obterPerfil: vi.fn().mockReturnValue(of(mockPerfil)),
      atualizarPermissoesPerfil: vi.fn().mockReturnValue(of({
        ...mockPerfil,
        permissoes: mockPermissoes,
      })),
    };

    await TestBed.configureTestingModule({
      imports: [PerfilListaComponent],
      providers: [
        provideRouter([]),
        { provide: SegurancaService, useValue: segurancaMock },
        { provide: Toast, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar perfis e permissões na inicialização', () => {
    expect(segurancaMock.listarPerfis).toHaveBeenCalledTimes(1);
    expect(segurancaMock.listarPermissoes).toHaveBeenCalledTimes(1);
    expect(component.perfis().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Administrador');
  });

  it('deve selecionar perfil, alternar permissão e salvar alterações', () => {
    component.selecionarPerfil(mockPerfil);
    expect(component.permissoesSelecionadasIds()).toEqual([10]);

    component.alternarPermissao(11);
    expect(component.permissoesSelecionadasIds()).toEqual([10, 11]);

    component.salvarPermissoes();
    expect(segurancaMock.atualizarPermissoesPerfil).toHaveBeenCalledWith(1, { permissaoIds: [10, 11] });
  });
});
