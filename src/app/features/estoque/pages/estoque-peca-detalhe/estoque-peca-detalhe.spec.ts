import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../core/auth/auth.service';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { Toast } from '../../../../shared/services/toast';
import { EstoquePecaDetalheComponent } from './estoque-peca-detalhe';

describe('EstoquePecaDetalheComponent (US-019)', () => {
  let component: EstoquePecaDetalheComponent;
  let fixture: ComponentFixture<EstoquePecaDetalheComponent>;

  const mockPeca = {
    id: 10,
    codigo: 'PEC-010',
    descricao: 'Pastilha de Freio Dianteira',
    fabricanteId: 1,
    categoriaId: 2,
    localizacaoId: 3,
    precoUnitario: 95.5,
    quantidade: 2,
    estoqueMinimo: 5,
    estoqueMaximo: 30,
    unidade: 'PAR',
    status: 'Ativo',
    observacoes: 'Linha original',
  };

  const mockMovimentacoes = [
    {
      id: 1,
      pecaId: 10,
      quantidade: 5,
      tipo: 'ENTRADA',
      referencia: 'NF 100',
      dataMovimentacao: '2026-11-01T10:00:00Z',
      usuario: 'Admin',
    },
    {
      id: 2,
      pecaId: 10,
      quantidade: 3,
      tipo: 'SAIDA',
      referencia: 'OS #45',
      dataMovimentacao: '2026-11-03T15:30:00Z',
      usuario: 'Mecânico João',
    },
    {
      id: 3,
      pecaId: 99,
      quantidade: 1,
      tipo: 'ENTRADA',
      referencia: 'Outra peça',
      dataMovimentacao: '2026-11-04T12:00:00Z',
      usuario: 'Admin',
    },
  ];

  const mockEstoqueService = {
    getPeca: vi.fn(),
    listarMovimentacoes: vi.fn(),
    categorias: vi.fn(),
    fabricantes: vi.fn(),
    localizacoes: vi.fn(),
    movimentar: vi.fn(),
    atualizarPeca: vi.fn(),
  };

  const mockAuthService = {
    currentUser: vi.fn(() => ({ name: 'Admin', email: 'admin@oficina.com' })),
  };

  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEstoqueService.getPeca.mockReturnValue(of(mockPeca));
    mockEstoqueService.listarMovimentacoes.mockReturnValue(of(mockMovimentacoes));
    mockEstoqueService.categorias.mockReturnValue(
      of([{ id: 2, nome: 'Freios', descricao: null }]),
    );
    mockEstoqueService.fabricantes.mockReturnValue(
      of([{ id: 1, nome: 'Cobreq', cnpj: null, contato: null }]),
    );
    mockEstoqueService.localizacoes.mockReturnValue(
      of([{ id: 3, descricao: 'Corredor B - Prat 2', corredor: 'B', prateleira: '2' }]),
    );

    await TestBed.configureTestingModule({
      imports: [EstoquePecaDetalheComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '10' : null),
              },
            },
          },
        },
        { provide: EstoqueService, useValue: mockEstoqueService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Toast, useValue: mockToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EstoquePecaDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar os detalhes da peça e filtrar/ordenar o histórico de movimentações', () => {
    expect(component).toBeTruthy();
    expect(mockEstoqueService.getPeca).toHaveBeenCalledWith(10);
    expect(mockEstoqueService.listarMovimentacoes).toHaveBeenCalledWith({ pecaId: 10 });

    expect(component.peca()?.descricao).toBe('Pastilha de Freio Dianteira');
    expect(component.movimentacoes().length).toBe(2);
    // Mais recente primeiro (id 2 em 03/11, id 1 em 01/11)
    expect(component.movimentacoes()[0].id).toBe(2);
    expect(component.movimentacoes()[1].id).toBe(1);
  });

  it('deve exibir o badge Crítico quando quantidade < estoqueMinimo', () => {
    expect(component.isCritico()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    const badges = compiled.querySelectorAll('.badge-critico');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('deve abrir os modais de entrada e saída e recarregar os dados ao salvar movimentação', () => {
    component.abrirModalEntrada();
    expect(component.entradaModalVisible()).toBe(true);

    component.abrirModalSaida();
    expect(component.saidaModalVisible()).toBe(true);

    mockEstoqueService.getPeca.mockClear();
    component.onMovimentacaoSalva();
    expect(mockEstoqueService.getPeca).toHaveBeenCalledWith(10);
  });

  it('deve exibir mensagem de erro quando getPeca falhar', () => {
    mockEstoqueService.getPeca.mockReturnValue(
      throwError(() => ({ error: { message: 'Peça não encontrada' } })),
    );

    component.carregarDados(999);
    fixture.detectChanges();

    expect(component.error()).toBe('Peça não encontrada');
  });
});

