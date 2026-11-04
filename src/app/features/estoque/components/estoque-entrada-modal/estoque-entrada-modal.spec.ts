import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../core/auth/auth.service';
import { EstoquePeca } from '../../../../core/models';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { Toast } from '../../../../shared/services/toast';
import { EstoqueEntradaModalComponent } from './estoque-entrada-modal';

describe('EstoqueEntradaModalComponent (US-019)', () => {
  let component: EstoqueEntradaModalComponent;
  let fixture: ComponentFixture<EstoqueEntradaModalComponent>;

  const mockPeca: EstoquePeca = {
    id: 10,
    codigo: 'PEC-010',
    descricao: 'Filtro de Ar Esportivo',
    fabricanteId: 1,
    categoriaId: 2,
    localizacaoId: 1,
    precoUnitario: 120,
    quantidade: 5,
    estoqueMinimo: 3,
    estoqueMaximo: 30,
    unidade: 'UN',
    status: 'Ativo',
    observacoes: 'Compatível com 300cc',
  };

  const mockEstoqueService = {
    movimentar: vi.fn(),
    atualizarPeca: vi.fn(),
  };

  const mockAuthService = {
    currentUser: vi.fn(() => ({ name: 'Carlos Estoquista', email: 'carlos@oficina.com' })),
  };

  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEstoqueService.movimentar.mockReturnValue(
      of({
        id: 101,
        pecaId: 10,
        quantidade: 8,
        tipo: 'ENTRADA',
        referencia: 'NF 9876',
        dataMovimentacao: '2026-11-04T20:00:00Z',
        usuario: 'Carlos Estoquista',
      }),
    );
    mockEstoqueService.atualizarPeca.mockReturnValue(of({ ...mockPeca, quantidade: 13 }));

    await TestBed.configureTestingModule({
      imports: [EstoqueEntradaModalComponent],
      providers: [
        provideNoopAnimations(),
        { provide: EstoqueService, useValue: mockEstoqueService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Toast, useValue: mockToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EstoqueEntradaModalComponent);
    component = fixture.componentInstance;
    component.peca = mockPeca;
    component.visible = true;
    fixture.detectChanges();
  });

  it('deve criar o componente e calcular o saldo projetado corretamente', () => {
    expect(component).toBeTruthy();
    component.form.patchValue({ quantidade: 4 });
    expect(component.saldoProjetado).toBe(9);
  });

  it('deve bloquear envio quando referencia estiver vazia ou quantidade < 1', () => {
    component.form.patchValue({ quantidade: 0, referencia: '   ' });
    component.salvar();

    expect(mockEstoqueService.movimentar).not.toHaveBeenCalled();
    expect(component.form.invalid).toBe(true);
  });

  it('deve registrar entrada via POST /api/v1/EstoqueMovimentacoes e incrementar o saldo da peça', () => {
    const savedSpy = vi.spyOn(component.saved, 'emit');
    const visibleSpy = vi.spyOn(component.visibleChange, 'emit');

    component.form.patchValue({
      quantidade: 8,
      referencia: 'NF 9876',
    });

    component.salvar();

    expect(mockEstoqueService.movimentar).toHaveBeenCalledWith({
      pecaId: 10,
      quantidade: 8,
      tipo: 'ENTRADA',
      referencia: 'NF 9876',
      usuario: 'Carlos Estoquista',
    });

    expect(mockEstoqueService.atualizarPeca).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        codigo: 'PEC-010',
        quantidade: 13,
      }),
    );

    expect(mockToast.success).toHaveBeenCalledWith('Entrada de estoque registrada com sucesso!');
    expect(savedSpy).toHaveBeenCalled();
    expect(visibleSpy).toHaveBeenCalledWith(false);
  });

  it('deve exibir erro via Toast quando a API falhar', () => {
    mockEstoqueService.movimentar.mockReturnValue(
      throwError(() => ({ error: { message: 'Falha ao salvar entrada' } })),
    );

    component.form.patchValue({
      quantidade: 5,
      referencia: 'NF 555',
    });

    component.salvar();

    expect(mockToast.error).toHaveBeenCalledWith('Falha ao salvar entrada');
    expect(component.submitting()).toBe(false);
  });
});

