import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BaixaContaAlvo,
  ContaPagarPagamentoResponse,
  ContaReceberPagamentoResponse,
  FinanceiroMetodoPagamento,
} from '../../../../core/models';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { Toast } from '../../../../shared/services/toast';
import { BaixaPagamentoModalComponent } from './baixa-pagamento-modal';

describe('BaixaPagamentoModalComponent (US-024)', () => {
  let fixture: ComponentFixture<BaixaPagamentoModalComponent>;
  let component: BaixaPagamentoModalComponent;

  const mockMetodos: FinanceiroMetodoPagamento[] = [
    { id: 901, nome: 'Dinheiro', descricao: null },
    { id: 904, nome: 'PIX', descricao: null },
    { id: 905, nome: 'Boleto', descricao: null },
  ];

  const mockContaPagar: BaixaContaAlvo = {
    id: 9201,
    tipo: 'PAGAR',
    descricao: 'Compra de filtros de óleo Bosch',
    valor: 580,
    vencimento: '2026-11-25',
    metodoId: 904,
    parceiroNome: 'AutoParts Bosch',
    observacao: 'Prazo 10 dias via PIX',
  };

  const mockContaReceber: BaixaContaAlvo = {
    id: 9302,
    tipo: 'RECEBER',
    descricao: 'Ordem #10002 - Suspensão dianteira',
    valor: 698,
    vencimento: '2026-11-10',
    metodoId: 904,
    parceiroNome: 'Carlos Silva',
    observacao: 'Aguardando pagamento',
  };

  const financeiroServiceMock = {
    registrarBaixaContaPagar: vi.fn(),
    registrarBaixaContaReceber: vi.fn(),
  };

  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [BaixaPagamentoModalComponent],
      providers: [
        { provide: FinanceiroService, useValue: financeiroServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BaixaPagamentoModalComponent);
    component = fixture.componentInstance;
  });

  function openModal(conta: BaixaContaAlvo, metodos: FinanceiroMetodoPagamento[] = mockMetodos): void {
    component.metodos = metodos;
    component.conta = conta;
    component.visible = true;
    component.ngOnChanges({
      metodos: new SimpleChange(null, metodos, true),
      conta: new SimpleChange(null, conta, true),
      visible: new SimpleChange(false, true, true),
    });
    fixture.detectChanges();
  }

  it('deve inicializar o modal com data pagamento, valor pago igual ao saldo e forma de pagamento (T-024.1)', () => {
    openModal(mockContaPagar);

    expect(component.saldoAtual()).toBe(580);
    expect(component.form.controls.valorPago.value).toBe(580);
    expect(component.form.controls.metodoId.value).toBe(904);
    expect(component.form.controls.dataPagamento.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(component.saldoResidual()).toBe(0);
    expect(component.isIntegral()).toBe(true);
    expect(component.isParcial()).toBe(false);
  });

  it('deve calcular o saldo residual em tempo real quando o usuário informa um pagamento parcial (T-024.1)', () => {
    openModal(mockContaPagar);

    component.form.controls.valorPago.setValue(200);
    fixture.detectChanges();

    expect(component.saldoAtual()).toBe(580);
    expect(component.saldoResidual()).toBe(380);
    expect(component.isParcial()).toBe(true);
    expect(component.isIntegral()).toBe(false);

    const summaryText = fixture.nativeElement.querySelector('.residual-summary')?.textContent ?? '';
    expect(summaryText).toContain('380');
    expect(summaryText).toContain('Pagamento Parcial');
  });

  it('deve enviar POST /api/v1/ContasPagarPagamentos ao confirmar baixa parcial de conta a pagar (T-024.2)', () => {
    openModal(mockContaPagar);
    const mockResponse: ContaPagarPagamentoResponse = {
      contaPagarId: 9201,
      pagamentoId: 9501,
      valorPago: 200,
      saldoResidual: 380,
      baixaIntegral: false,
      conta: {
        id: 9201,
        fornecedorId: 301,
        descricao: 'Compra de filtros de óleo Bosch',
        valor: 380,
        vencimento: '2026-11-25',
        status: 'PENDENTE',
        dataPagamento: null,
        metodoId: 904,
        observacao: 'Adiantamento via PIX',
      },
    };
    financeiroServiceMock.registrarBaixaContaPagar.mockReturnValue(of(mockResponse));

    const emitSpy = vi.spyOn(component.baixaRegistrada, 'emit');
    component.form.patchValue({
      dataPagamento: '2026-11-16',
      valorPago: 200,
      metodoId: 904,
      observacao: 'Adiantamento via PIX',
    });

    component.confirmarBaixa();

    expect(financeiroServiceMock.registrarBaixaContaPagar).toHaveBeenCalledWith({
      contaPagarId: 9201,
      dataPagamento: '2026-11-16',
      valorPago: 200,
      metodoId: 904,
      observacao: 'Adiantamento via PIX',
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(mockResponse);
    expect(component.visible).toBe(false);
  });

  it('deve enviar POST /api/v1/ContasReceberPagamentos ao confirmar baixa integral de conta a receber (T-024.3)', () => {
    openModal(mockContaReceber);
    const mockResponse: ContaReceberPagamentoResponse = {
      contaReceberId: 9302,
      pagamentoId: 9502,
      valorPago: 698,
      saldoResidual: 0,
      baixaIntegral: true,
      conta: {
        id: 9302,
        clienteId: 202,
        descricao: 'Ordem #10002 - Suspensão dianteira',
        valor: 698,
        vencimento: '2026-11-10',
        status: 'RECEBIDO',
        dataRecebimento: '2026-11-16',
        metodoId: 904,
        observacao: 'Recebido no balcão',
      },
    };
    financeiroServiceMock.registrarBaixaContaReceber.mockReturnValue(of(mockResponse));

    const emitSpy = vi.spyOn(component.baixaRegistrada, 'emit');
    component.form.patchValue({
      dataPagamento: '2026-11-16',
      valorPago: 698,
      metodoId: 904,
      observacao: 'Recebido no balcão',
    });

    component.confirmarBaixa();

    expect(financeiroServiceMock.registrarBaixaContaReceber).toHaveBeenCalledWith({
      contaReceberId: 9302,
      dataPagamento: '2026-11-16',
      valorPago: 698,
      metodoId: 904,
      observacao: 'Recebido no balcão',
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(mockResponse);
  });

  it('deve bloquear a submissão quando valorPago exceder o saldo atual ou campos obrigatórios forem inválidos', () => {
    openModal(mockContaPagar);

    component.form.patchValue({
      valorPago: 700,
    });
    fixture.detectChanges();

    expect(component.valorExcedente()).toBe(true);
    component.confirmarBaixa();

    expect(financeiroServiceMock.registrarBaixaContaPagar).not.toHaveBeenCalled();
    expect(toastMock.error).toHaveBeenCalled();

    vi.clearAllMocks();
    component.form.patchValue({
      valorPago: 0,
      metodoId: null,
    });
    component.confirmarBaixa();
    expect(financeiroServiceMock.registrarBaixaContaPagar).not.toHaveBeenCalled();
  });

  it('deve manter o modal aberto e exibir toast de erro caso a requisição à API falhe', () => {
    openModal(mockContaReceber);
    financeiroServiceMock.registrarBaixaContaReceber.mockReturnValueOnce(
      throwError(() => ({ error: { message: 'Falha ao processar baixa.' } })),
    );

    component.confirmarBaixa();

    expect(toastMock.error).toHaveBeenCalledWith(
      'Erro ao registrar baixa',
      'Falha ao processar baixa.',
    );
    expect(component.visible).toBe(true);
    expect(component.submitting()).toBe(false);
  });
});
