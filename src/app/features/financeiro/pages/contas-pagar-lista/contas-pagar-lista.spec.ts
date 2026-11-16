import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../../../app.routes';
import { FinanceiroContaPagar } from '../../../../core/models';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { ContasPagarListaComponent } from './contas-pagar-lista';

describe('ContasPagarListaComponent (US-020)', () => {
  let fixture: ComponentFixture<ContasPagarListaComponent>;
  let component: ContasPagarListaComponent;

  const mockContas: FinanceiroContaPagar[] = [
    {
      id: 9201,
      fornecedorId: 301,
      descricao: 'Compra de filtros de óleo Bosch',
      valor: 580,
      vencimento: '2025-11-18T02:00:02',
      status: 'PENDENTE',
      dataPagamento: null,
      metodoId: 904,
      observacao: 'Prazo 10 dias via PIX',
    },
    {
      id: 9202,
      fornecedorId: 302,
      descricao: 'Compra de amortecedores Monroe',
      valor: 1396,
      vencimento: '2025-11-03T02:00:02',
      status: 'PAGO',
      dataPagamento: '2025-11-05T02:00:02',
      metodoId: 902,
      observacao: 'Parcela única no cartão',
    },
    {
      id: 9203,
      fornecedorId: 301,
      descricao: 'Aluguel do Galpão',
      valor: 2500,
      vencimento: '2099-12-20T00:00:00',
      status: 'PENDENTE',
      dataPagamento: null,
      metodoId: 905,
      observacao: 'Boleto mensal',
    },
    {
      id: 9204,
      fornecedorId: null,
      descricao: 'Compra antiga cancelada',
      valor: 300,
      vencimento: '2023-05-10T00:00:00',
      status: 'CANCELADO',
      dataPagamento: null,
      metodoId: null,
      observacao: 'Fornecedor inativo',
    },
  ];

  const mockFornecedores = [
    { id: 301, nomeFantasia: 'AutoParts Bosch', razaoSocial: 'Bosch Ltda' },
    { id: 302, nomeFantasia: 'Monroe Suspensões', razaoSocial: 'Monroe SA' },
  ];

  const mockMetodos = [
    { id: 902, nome: 'Cartão de Crédito', descricao: null },
    { id: 904, nome: 'PIX', descricao: null },
    { id: 905, nome: 'Boleto', descricao: null },
  ];

  const financeiroServiceMock = {
    contasPagar: vi.fn().mockReturnValue(of(mockContas)),
    metodos: vi.fn().mockReturnValue(of(mockMetodos)),
  };

  const fornecedoresServiceMock = {
    list: vi.fn().mockReturnValue(of(mockFornecedores)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    financeiroServiceMock.contasPagar.mockReturnValue(of(mockContas));
    financeiroServiceMock.metodos.mockReturnValue(of(mockMetodos));
    fornecedoresServiceMock.list.mockReturnValue(of(mockFornecedores));

    await TestBed.configureTestingModule({
      imports: [ContasPagarListaComponent],
      providers: [
        provideRouter([]),
        { provide: FinanceiroService, useValue: financeiroServiceMock },
        { provide: FornecedoresService, useValue: fornecedoresServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContasPagarListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o ContasPagarListaComponent e carregar contas, fornecedores e métodos (T-020.1)', () => {
    expect(component).toBeTruthy();
    expect(financeiroServiceMock.contasPagar).toHaveBeenCalledTimes(1);
    expect(fornecedoresServiceMock.list).toHaveBeenCalledTimes(1);
    expect(financeiroServiceMock.metodos).toHaveBeenCalledTimes(1);
    expect(component.contas().length).toBe(4);
    expect(component.getFornecedorNome(301)).toBe('AutoParts Bosch');
    expect(component.getMetodoNome(904)).toBe('PIX');

    const rows = fixture.nativeElement.querySelectorAll('tbody tr.data-row');
    expect(rows.length).toBe(4);
  });

  it('deve registrar a rota /financeiro/contas-pagar em app.routes.ts apontando para ContasPagarListaComponent (T-020.2)', () => {
    const mainRoute = routes.find((r) => r.path === '' && Array.isArray(r.children));
    expect(mainRoute).toBeTruthy();
    const contasPagarRoute = mainRoute?.children?.find((c) => c.path === 'financeiro/contas-pagar');
    expect(contasPagarRoute).toBeTruthy();
    expect(contasPagarRoute?.component).toBe(ContasPagarListaComponent);
  });

  it('deve destacar visualmente contas vencidas (.row-vencida, .status-vencido, .overdue-pill) e não destacar contas pagas ou canceladas (T-020.4)', () => {
    // 9201 tem status PENDENTE e vencimento em 2025-11-18 (< hoje) -> VENCIDO
    expect(component.isVencida(mockContas[0])).toBe(true);
    expect(component.getEffectiveStatus(mockContas[0])).toBe('VENCIDO');

    // 9202 tem status PAGO -> PAGO (não vencida)
    expect(component.isVencida(mockContas[1])).toBe(false);
    expect(component.getEffectiveStatus(mockContas[1])).toBe('PAGO');

    // 9203 tem status PENDENTE e vencimento em 2099-12-20 (>= hoje) -> PENDENTE (não vencida)
    expect(component.isVencida(mockContas[2])).toBe(false);
    expect(component.getEffectiveStatus(mockContas[2])).toBe('PENDENTE');

    // 9204 tem status CANCELADO -> CANCELADO (não vencida)
    expect(component.isVencida(mockContas[3])).toBe(false);
    expect(component.getEffectiveStatus(mockContas[3])).toBe('CANCELADO');

    const vencidaRows = fixture.nativeElement.querySelectorAll('tbody tr.row-vencida');
    expect(vencidaRows.length).toBe(1);
    expect(vencidaRows[0].textContent).toContain('Compra de filtros de óleo Bosch');

    const statusVencidoBadges = fixture.nativeElement.querySelectorAll('.status-badge.status-vencido');
    expect(statusVencidoBadges.length).toBe(1);
    expect(statusVencidoBadges[0].textContent.trim()).toBe('Vencido');

    const overduePills = fixture.nativeElement.querySelectorAll('.overdue-pill');
    expect(overduePills.length).toBe(1);
  });

  it('deve filtrar contas por status e período de vencimento e permitir limpar filtros (T-020.3)', () => {
    // Filtro por status VENCIDO
    component.setStatusFilter('VENCIDO');
    fixture.detectChanges();
    expect(component.filteredContas().map((c) => c.id)).toEqual([9201]);

    // Filtro por status PENDENTE (no prazo)
    component.setStatusFilter('PENDENTE');
    fixture.detectChanges();
    expect(component.filteredContas().map((c) => c.id)).toEqual([9203]);

    // Filtro por status PAGO
    component.setStatusFilter('PAGO');
    fixture.detectChanges();
    expect(component.filteredContas().map((c) => c.id)).toEqual([9202]);

    // Limpar filtros e testar filtro por período de vencimento (novembro/2025)
    component.limparFiltros();
    component.setDataInicio('2025-11-01');
    component.setDataFim('2025-11-30');
    fixture.detectChanges();

    expect(component.filteredContas().map((c) => c.id)).toEqual([9202, 9201]);

    // Combinar período + status VENCIDO
    component.setStatusFilter('VENCIDO');
    fixture.detectChanges();
    expect(component.filteredContas().map((c) => c.id)).toEqual([9201]);

    // Limpar filtros restaura todas as 4 contas
    component.limparFiltros();
    fixture.detectChanges();
    expect(component.filteredContas().length).toBe(4);
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('deve exibir estado de erro e permitir tentar novamente quando a API falhar', () => {
    financeiroServiceMock.contasPagar.mockReturnValueOnce(throwError(() => new Error('Falha HTTP')));
    component.carregarDados();
    fixture.detectChanges();

    expect(component.error()).toBe('Não foi possível carregar a lista de contas a pagar.');
    const alertEl = fixture.nativeElement.querySelector('.error-state');
    expect(alertEl).toBeTruthy();
  });
});
