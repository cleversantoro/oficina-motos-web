import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../../../app.routes';
import { FinanceiroContaReceber } from '../../../../core/models';
import { ClientesService } from '../../../../core/services/clientes.service';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { ContasReceberListaComponent } from './contas-receber-lista';

describe('ContasReceberListaComponent (US-022)', () => {
  let fixture: ComponentFixture<ContasReceberListaComponent>;
  let component: ContasReceberListaComponent;

  const mockContasReceber: FinanceiroContaReceber[] = [
    {
      id: 9101,
      clienteId: 101,
      descricao: 'Pagamento OS #12 - PIX',
      valor: 450,
      vencimento: '2025-11-10T00:00:00',
      status: 'Recebido',
      dataRecebimento: '2025-11-10T00:00:00',
      metodoId: 904,
      observacao: 'Referente à OS #12',
    },
    {
      id: 9102,
      clienteId: 102,
      descricao: 'Revisão periódica 10.000 km',
      valor: 680,
      vencimento: '2025-11-15T00:00:00',
      status: 'PENDENTE',
      dataRecebimento: null,
      metodoId: 905,
      observacao: 'Parcela 1/2 (OS #45)',
    },
    {
      id: 9103,
      clienteId: 101,
      ordemServicoId: 78,
      descricao: 'Serviço de elétrica',
      valor: 320,
      vencimento: '2099-12-20T00:00:00',
      status: 'PENDENTE',
      dataRecebimento: null,
      metodoId: 902,
      observacao: 'Aguardando faturamento',
    },
    {
      id: 9104,
      clienteId: null,
      descricao: 'Venda avulsa de óleo no balcão',
      valor: 95,
      vencimento: '2099-12-25T00:00:00',
      status: 'PENDENTE',
      dataRecebimento: null,
      metodoId: 904,
      observacao: 'Lançamento manual sem OS',
    },
  ];

  const mockClientes = [
    { id: 101, nome: 'Carlos Eduardo Silva', nomeExibicao: 'Carlos Silva' },
    { id: 102, nome: 'Transportadora Rápida Ltda', nomeExibicao: 'Transportadora Rápida' },
  ];

  const mockMetodos = [
    { id: 902, nome: 'Cartão de Crédito', descricao: null },
    { id: 904, nome: 'PIX', descricao: null },
    { id: 905, nome: 'Boleto', descricao: null },
  ];

  const financeiroServiceMock = {
    contasReceber: vi.fn().mockReturnValue(of(mockContasReceber)),
    metodos: vi.fn().mockReturnValue(of(mockMetodos)),
  };

  const clientesServiceMock = {
    list: vi.fn().mockReturnValue(of(mockClientes)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    financeiroServiceMock.contasReceber.mockReturnValue(of(mockContasReceber));
    financeiroServiceMock.metodos.mockReturnValue(of(mockMetodos));
    clientesServiceMock.list.mockReturnValue(of(mockClientes));

    await TestBed.configureTestingModule({
      imports: [ContasReceberListaComponent],
      providers: [
        provideRouter([]),
        { provide: FinanceiroService, useValue: financeiroServiceMock },
        { provide: ClientesService, useValue: clientesServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContasReceberListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o ContasReceberListaComponent e carregar contas a receber, clientes e métodos (T-022.1)', () => {
    expect(component).toBeTruthy();
    expect(financeiroServiceMock.contasReceber).toHaveBeenCalledTimes(1);
    expect(clientesServiceMock.list).toHaveBeenCalledTimes(1);
    expect(financeiroServiceMock.metodos).toHaveBeenCalledTimes(1);
    expect(component.contas().length).toBe(4);
    expect(component.getClienteNome(101)).toBe('Carlos Silva');
    expect(component.getMetodoNome(904)).toBe('PIX');

    const rows = fixture.nativeElement.querySelectorAll('tbody tr.data-row');
    expect(rows.length).toBe(4);
  });

  it('deve registrar a rota /financeiro/contas-receber em app.routes.ts apontando para ContasReceberListaComponent (T-022.2)', () => {
    const mainRoute = routes.find((r) => r.path === '' && Array.isArray(r.children));
    expect(mainRoute).toBeTruthy();
    const contasReceberRoute = mainRoute?.children?.find(
      (c) => c.path === 'financeiro/contas-receber',
    );
    expect(contasReceberRoute).toBeTruthy();
    expect(contasReceberRoute?.component).toBe(ContasReceberListaComponent);
  });

  it('deve exibir a coluna "OS Origem" com link para /ordens/:id quando houver OS vinculada e "-" quando for manual (T-022.3)', () => {
    // 9101: "Pagamento OS #12 - PIX" -> OS 12
    expect(component.getOrdemServicoId(mockContasReceber[0])).toBe(12);
    // 9102: observacao "Parcela 1/2 (OS #45)" -> OS 45
    expect(component.getOrdemServicoId(mockContasReceber[1])).toBe(45);
    // 9103: ordemServicoId: 78 -> OS 78
    expect(component.getOrdemServicoId(mockContasReceber[2])).toBe(78);
    // 9104: sem OS -> null
    expect(component.getOrdemServicoId(mockContasReceber[3])).toBeNull();

    const osLinks = fixture.nativeElement.querySelectorAll('a.os-origin-link');
    expect(osLinks.length).toBe(3);
    expect(osLinks[0].textContent.trim()).toBe('OS #12');
    expect(osLinks[0].getAttribute('href')).toBe('/ordens/12');
    expect(osLinks[1].textContent.trim()).toBe('OS #45');
    expect(osLinks[1].getAttribute('href')).toBe('/ordens/45');
    expect(osLinks[2].textContent.trim()).toBe('OS #78');
    expect(osLinks[2].getAttribute('href')).toBe('/ordens/78');
  });

  it('deve exibir o botão "+ Nova Conta" (/financeiro/contas-receber/novo) e os links "Editar" (/financeiro/contas-receber/:id/editar) na listagem (T-023.2)', () => {
    const newBtn = fixture.nativeElement.querySelector('a.btn-new-conta');
    expect(newBtn).toBeTruthy();
    expect(newBtn.textContent.trim()).toBe('+ Nova Conta');
    expect(newBtn.getAttribute('href')).toBe('/financeiro/contas-receber/novo');

    const editLinks = fixture.nativeElement.querySelectorAll('a.btn-edit-conta');
    expect(editLinks.length).toBe(4);
    expect(editLinks[0].getAttribute('href')).toBe('/financeiro/contas-receber/9101/editar');
    expect(editLinks[1].getAttribute('href')).toBe('/financeiro/contas-receber/9102/editar');
  });

  it('deve filtrar contas a receber por status, período e termo de busca (incluindo número da OS)', () => {
    component.setStatusFilter('RECEBIDO');
    fixture.detectChanges();
    expect(component.filteredContas().map((c) => c.id)).toEqual([9101]);

    component.setStatusFilter('VENCIDO');
    fixture.detectChanges();
    expect(component.filteredContas().map((c) => c.id)).toEqual([9102]);

    component.limparFiltros();
    component.setSearchTerm('OS #45');
    fixture.detectChanges();
    expect(component.filteredContas().map((c) => c.id)).toEqual([9102]);

    component.limparFiltros();
    fixture.detectChanges();
    expect(component.filteredContas().length).toBe(4);
  });

  it('deve exibir estado de erro e permitir tentar novamente quando a API falhar', () => {
    financeiroServiceMock.contasReceber.mockReturnValueOnce(
      throwError(() => new Error('Falha HTTP')),
    );
    component.carregarDados();
    fixture.detectChanges();

    expect(component.error()).toBe('Não foi possível carregar a lista de contas a receber.');
    const alertEl = fixture.nativeElement.querySelector('.error-state');
    expect(alertEl).toBeTruthy();
  });

  it('deve exibir botão "Baixar" apenas para recebíveis PENDENTE ou VENCIDO e atualizar a lista após baixa parcial ou integral (US-024)', () => {
    // 9101 é RECEBIDO; 9102 (VENCIDO), 9103 (PENDENTE) e 9104 (PENDENTE) permitem baixa
    const baixaBtns = fixture.nativeElement.querySelectorAll('button.btn-baixa-conta');
    expect(baixaBtns.length).toBe(3);

    component.abrirModalBaixa(mockContasReceber[1]);
    expect(component.modalBaixaVisivel()).toBe(true);
    expect(component.contaSelecionadaBaixa()?.id).toBe(9102);
    expect(component.contaSelecionadaBaixa()?.tipo).toBe('RECEBER');

    // Simular baixa parcial de R$ 280,00 em 9102 (saldo residual = R$ 400,00)
    component.onBaixaRegistrada({
      contaReceberId: 9102,
      pagamentoId: 9601,
      valorPago: 280,
      saldoResidual: 400,
      baixaIntegral: false,
      conta: {
        ...mockContasReceber[1],
        valor: 400,
        status: 'PENDENTE',
      },
    });
    fixture.detectChanges();

    expect(component.modalBaixaVisivel()).toBe(false);
    const contaParcial = component.contas().find((c) => c.id === 9102);
    expect(contaParcial?.valor).toBe(400);

    // Simular baixa integral do saldo residual de R$ 400,00
    component.onBaixaRegistrada({
      contaReceberId: 9102,
      pagamentoId: 9602,
      valorPago: 400,
      saldoResidual: 0,
      baixaIntegral: true,
      conta: {
        ...mockContasReceber[1],
        valor: 400,
        status: 'RECEBIDO',
        dataRecebimento: '2026-11-16',
      },
    });
    fixture.detectChanges();

    const contaQuitada = component.contas().find((c) => c.id === 9102);
    expect(contaQuitada?.status).toBe('RECEBIDO');
    expect(component.podeBaixar(contaQuitada!)).toBe(false);
  });
});
