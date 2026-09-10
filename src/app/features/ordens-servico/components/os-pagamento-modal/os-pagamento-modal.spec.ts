import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { OsPagamentoModalComponent } from './os-pagamento-modal';
import { OrdensService } from '../../../../core/services/ordens.service';
import { Toast } from '../../../../shared/services/toast';
import { OrdemServicoPagamento } from '../../../../core/models';

describe('OsPagamentoModalComponent', () => {
  let component: OsPagamentoModalComponent;
  let fixture: ComponentFixture<OsPagamentoModalComponent>;

  const ordensServiceMock = {
    addPagamento: vi.fn(),
  };

  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [OsPagamentoModalComponent],
      providers: [
        { provide: OrdensService, useValue: ordensServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OsPagamentoModalComponent);
    component = fixture.componentInstance;
    component.ordemServicoId = 42;
    component.saldoPendente = 350.0;
    component.visible = true;
    fixture.detectChanges();
  });

  it('deve inicializar com valores padrão e métodos homologados', () => {
    expect(component).toBeTruthy();
    expect(component.metodosHomologados.length).toBe(5);
    expect(component.submitting()).toBe(false);
  });

  it('deve preencher valor com saldo pendente ao abrir modal via ngOnChanges', () => {
    component.ngOnChanges({
      visible: new SimpleChange(false, true, true),
    });
    expect(component.valor()).toBe(350.0);
    expect(component.isIntegral()).toBe(true);
    expect(component.formularioValido()).toBe(true);
  });

  it('deve calcular corretamente isIntegral e valorExcedente', () => {
    component.saldoPendente = 300.0;

    component.valor.set(150.0);
    expect(component.isIntegral()).toBe(false);
    expect(component.valorExcedente()).toBe(false);
    expect(component.formularioValido()).toBe(true);

    component.valor.set(300.0);
    expect(component.isIntegral()).toBe(true);
    expect(component.valorExcedente()).toBe(false);
    expect(component.formularioValido()).toBe(true);

    component.valor.set(350.0);
    expect(component.isIntegral()).toBe(true);
    expect(component.valorExcedente()).toBe(true);
    expect(component.formularioValido()).toBe(false);

    component.valor.set(0);
    expect(component.formularioValido()).toBe(false);
  });

  it('deve preencher total pendente ao clicar em preencherTotal', () => {
    component.saldoPendente = 450.0;
    component.valor.set(100.0);

    component.preencherTotal();
    expect(component.valor()).toBe(450.0);
    expect(component.isIntegral()).toBe(true);
  });

  it('deve registrar pagamento com sucesso e emitir pagamentoRegistrado', () => {
    const mockPagamentoCriado: OrdemServicoPagamento = {
      id: 99,
      ordemServicoId: 42,
      valor: 350.0,
      metodo: 'PIX',
      status: 'Liquidado',
      dataPagamento: '2026-03-09T00:00:00.000Z',
      observacao: 'Pago no balcão',
      statusOrdemServico: 'Concluida',
    };

    ordensServiceMock.addPagamento.mockReturnValue(of(mockPagamentoCriado));
    const spyEmit = vi.spyOn(component.pagamentoRegistrado, 'emit');
    const spyVisibleChange = vi.spyOn(component.visibleChange, 'emit');

    component.saldoPendente = 350.0;
    component.valor.set(350.0);
    component.metodo.set('PIX');
    component.observacao.set('Pago no balcão');

    component.salvar();

    expect(ordensServiceMock.addPagamento).toHaveBeenCalledWith(
      expect.objectContaining({
        ordemServicoId: 42,
        valor: 350.0,
        metodo: 'PIX',
        status: 'Liquidado',
      })
    );
    expect(toastMock.success).toHaveBeenCalled();
    expect(spyEmit).toHaveBeenCalledWith(mockPagamentoCriado);
    expect(spyVisibleChange).toHaveBeenCalledWith(false);
  });

  it('deve exibir mensagem de erro no toast caso a API falhe', () => {
    ordensServiceMock.addPagamento.mockReturnValue(
      throwError(() => ({ error: { message: 'Erro na API' } }))
    );
    const spyEmit = vi.spyOn(component.pagamentoRegistrado, 'emit');

    component.saldoPendente = 350.0;
    component.valor.set(100.0);
    component.salvar();

    expect(toastMock.error).toHaveBeenCalledWith('Erro ao registrar pagamento', 'Erro na API');
    expect(spyEmit).not.toHaveBeenCalled();
    expect(component.submitting()).toBe(false);
  });

  it('deve emitir visibleChange(false) ao fechar', () => {
    const spyVisibleChange = vi.spyOn(component.visibleChange, 'emit');
    component.fechar();
    expect(spyVisibleChange).toHaveBeenCalledWith(false);
    expect(component.visible).toBe(false);
  });
});

