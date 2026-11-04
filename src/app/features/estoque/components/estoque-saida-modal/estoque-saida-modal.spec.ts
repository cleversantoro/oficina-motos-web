import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../core/auth/auth.service';
import { EstoquePeca } from '../../../../core/models';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { Toast } from '../../../../shared/services/toast';
import { EstoqueSaidaModalComponent } from './estoque-saida-modal';

describe('EstoqueSaidaModalComponent (US-019)', () => {
  let component: EstoqueSaidaModalComponent;
  let fixture: ComponentFixture<EstoqueSaidaModalComponent>;

  const mockPeca: EstoquePeca = {
    id: 10,
    codigo: 'PEC-010',
    descricao: 'Filtro de Ar Esportivo',
    fabricanteId: 1,
    categoriaId: 2,
    localizacaoId: 1,
    precoUnitario: 120,
    quantidade: 6,
    estoqueMinimo: 3,
    estoqueMaximo: 30,
    unidade: 'UN',
    status: 'Ativo',
    observacoes: null,
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
        id: 202,
        pecaId: 10,
        quantidade: 2,
        tipo: 'SAIDA',
        referencia: 'OS #105',
        dataMovimentacao: '2026-11-04T20:10:00Z',
        usuario: 'Carlos Estoquista',
      }),
    );
    mockEstoqueService.atualizarPeca.mockReturnValue(of({ ...mockPeca, quantidade: 4 }));

    await TestBed.configureTestingModule({
      imports: [EstoqueSaidaModalComponent],
      providers: [
        provideNoopAnimations(),
        { provide: EstoqueService, useValue: mockEstoqueService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Toast, useValue: mockToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EstoqueSaidaModalComponent);
    component = fixture.componentInstance;
    component.peca = mockPeca;
    component.visible = true;
    fixture.detectChanges();
  });

  it('deve criar o componente e calcular o saldo restante corretamente', () => {
    expect(component).toBeTruthy();
    component.form.patchValue({ quantidade: 2 });
    expect(component.saldoRestante).toBe(4);
    expect(component.excedeSaldo).toBe(false);
  });

  it('deve bloquear a saída quando a quantidade informada exceder o saldo disponível', () => {
    component.form.patchValue({
      quantidade: 10, // saldo disponível é 6
      referencia: 'OS #999',
    });

    expect(component.excedeSaldo).toBe(true);
    component.salvar();

    expect(mockEstoqueService.movimentar).not.toHaveBeenCalled();
    expect(component.form.controls.quantidade.hasError('max')).toBe(true);
  });

  it('deve registrar saída via POST /api/v1/EstoqueMovimentacoes e decrementar o saldo da peça', () => {
    const savedSpy = vi.spyOn(component.saved, 'emit');
    const visibleSpy = vi.spyOn(component.visibleChange, 'emit');

    component.form.patchValue({
      quantidade: 2,
      referencia: 'OS #105',
    });

    component.salvar();

    expect(mockEstoqueService.movimentar).toHaveBeenCalledWith({
      pecaId: 10,
      quantidade: 2,
      tipo: 'SAIDA',
      referencia: 'OS #105',
      usuario: 'Carlos Estoquista',
    });

    expect(mockEstoqueService.atualizarPeca).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        codigo: 'PEC-010',
        quantidade: 4,
      }),
    );

    expect(mockToast.success).toHaveBeenCalledWith('Saída de estoque registrada com sucesso!');
    expect(savedSpy).toHaveBeenCalled();
    expect(visibleSpy).toHaveBeenCalledWith(false);
  });

  it('deve exibir erro via Toast quando a API falhar ao registrar saída', () => {
    mockEstoqueService.movimentar.mockReturnValue(
      throwError(() => ({ error: { message: 'Erro ao registrar baixa' } })),
    );

    component.form.patchValue({
      quantidade: 1,
      referencia: 'OS #106',
    });

    component.salvar();

    expect(mockToast.error).toHaveBeenCalledWith('Erro ao registrar baixa');
    expect(component.submitting()).toBe(false);
  });
});

