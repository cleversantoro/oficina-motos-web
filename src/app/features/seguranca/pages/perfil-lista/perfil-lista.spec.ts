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
    { id: 10, moduloId: 1, nomeModulo: 'Ordens de Serviço', acao: 'visualizar', codigo: 'ordens:visualizar' },
    { id: 11, moduloId: 1, nomeModulo: 'Ordens de Serviço', acao: 'criar', codigo: 'ordens:criar' },
    { id: 20, moduloId: 2, nomeModulo: 'Clientes', acao: 'visualizar', codigo: 'clientes:visualizar' },
    { id: 21, moduloId: 2, nomeModulo: 'Clientes', acao: 'excluir', codigo: 'clientes:excluir' },
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

  it('deve agrupar permissões em cards separados por nomeModulo e permitir marcar/desmarcar todas do módulo', () => {
    component.selecionarPerfil(mockPerfil);
    fixture.detectChanges();

    const grupos = component.permissoesAgrupadas();
    expect(grupos.map(g => g.modulo)).toEqual(['Clientes', 'Ordens de Serviço']);

    const cards = fixture.nativeElement.querySelectorAll('.modulo-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Clientes');
    expect(fixture.nativeElement.textContent).toContain('Ordens de Serviço');

    component.alternarTodasNoModulo(grupos[0].items, true);
    expect(component.todosSelecionadosNoModulo(grupos[0].items)).toBe(true);
    expect(component.permissoesSelecionadasIds()).toEqual(expect.arrayContaining([10, 20, 21]));

    component.alternarTodasNoModulo(grupos[0].items, false);
    expect(component.contarSelecionadasNoModulo(grupos[0].items)).toBe(0);
  });
});
