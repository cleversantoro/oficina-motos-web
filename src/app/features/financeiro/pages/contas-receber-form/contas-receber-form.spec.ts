import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../../../app.routes';
import { FinanceiroContaReceber } from '../../../../core/models';
import { ClientesService } from '../../../../core/services/clientes.service';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { Toast } from '../../../../shared/services/toast';
import { ContasReceberFormComponent } from './contas-receber-form';

describe('ContasReceberFormComponent (US-023)', () => {
  let fixture: ComponentFixture<ContasReceberFormComponent>;
  let component: ContasReceberFormComponent;
  let router: Router;
  let routeId: string | null = null;

  const mockContaExistente: FinanceiroContaReceber = {
    id: 9301,
    clienteId: 101,
    descricao: 'Venda avulsa de capacete e luvas',
    valor: 450.5,
    vencimento: '2026-11-25T00:00:00',
    status: 'PENDENTE',
    dataRecebimento: null,
    metodoId: 904,
    observacao: 'Pagamento combinado para dia 25 via PIX',
  };

  const mockClientes = [
    { id: 101, nome: 'Carlos Eduardo Silva', nomeExibicao: 'Carlos Silva' },
    { id: 102, nome: 'Transportadora Rápida Ltda', nomeExibicao: 'Transportadora Rápida' },
  ];

  const mockMetodos = [
    { id: 902, nome: 'Cartão de Crédito', descricao: null },
    { id: 904, nome: 'PIX', descricao: null },
  ];

  const financeiroServiceMock = {
    getContaReceberById: vi.fn(),
    createContaReceber: vi.fn(),
    updateContaReceber: vi.fn(),
    metodos: vi.fn(),
  };

  const clientesServiceMock = {
    list: vi.fn(),
  };

  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };

  async function setupComponent(idParam: string | null = null): Promise<void> {
    routeId = idParam;

    await TestBed.configureTestingModule({
      imports: [ContasReceberFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get paramMap() {
                return convertToParamMap(routeId !== null ? { id: routeId } : {});
              },
            },
          },
        },
        { provide: FinanceiroService, useValue: financeiroServiceMock },
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ContasReceberFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    financeiroServiceMock.getContaReceberById.mockReturnValue(of(mockContaExistente));
    financeiroServiceMock.createContaReceber.mockImplementation((payload) =>
      of({ id: 9400, ...payload }),
    );
    financeiroServiceMock.updateContaReceber.mockImplementation((id, payload) =>
      of({ id: Number(id), ...payload }),
    );
    financeiroServiceMock.metodos.mockReturnValue(of(mockMetodos));
    clientesServiceMock.list.mockReturnValue(of(mockClientes));
  });

  it('deve registrar as rotas de criação (/financeiro/contas-receber/novo) e edição (/financeiro/contas-receber/:id/editar) em app.routes.ts (T-023.2)', () => {
    const mainRoute = routes.find((r) => r.path === '' && Array.isArray(r.children));
    expect(mainRoute).toBeTruthy();

    const createRoute = mainRoute?.children?.find(
      (c) => c.path === 'financeiro/contas-receber/novo',
    );
    const editRoute = mainRoute?.children?.find(
      (c) => c.path === 'financeiro/contas-receber/:id/editar',
    );

    expect(createRoute).toBeTruthy();
    expect(createRoute?.component).toBe(ContasReceberFormComponent);
    expect(editRoute).toBeTruthy();
    expect(editRoute?.component).toBe(ContasReceberFormComponent);
  });

  it('deve iniciar em modo de criação quando não houver parâmetro :id e carregar clientes e métodos (T-023.1)', async () => {
    await setupComponent(null);

    expect(component.isEditMode()).toBe(false);
    expect(component.contaId()).toBeNull();
    expect(financeiroServiceMock.getContaReceberById).not.toHaveBeenCalled();
    expect(clientesServiceMock.list).toHaveBeenCalledTimes(1);
    expect(financeiroServiceMock.metodos).toHaveBeenCalledTimes(1);
    expect(component.form.controls.status.value).toBe('PENDENTE');

    const title = fixture.nativeElement.querySelector('h1');
    expect(title?.textContent).toContain('Nova Conta a Receber');
  });

  it('deve validar campos obrigatórios e impedir envio inválido em modo de criação (T-023.1)', async () => {
    await setupComponent(null);

    component.salvar();
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
    expect(financeiroServiceMock.createContaReceber).not.toHaveBeenCalled();

    const errors = fixture.nativeElement.querySelectorAll('.field-error');
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('deve enviar POST via createContaReceber e navegar para /financeiro/contas-receber ao salvar nova conta manual válida (T-023.1)', async () => {
    await setupComponent(null);

    component.form.patchValue({
      descricao: '  Venda avulsa de óleo sintético  ',
      clienteId: 101,
      valor: 185.9,
      vencimento: '2026-11-30',
      status: 'PENDENTE',
      metodoId: 904,
      dataRecebimento: '',
      observacao: '  Balcão  ',
    });

    component.salvar();

    expect(financeiroServiceMock.createContaReceber).toHaveBeenCalledWith({
      descricao: 'Venda avulsa de óleo sintético',
      clienteId: 101,
      valor: 185.9,
      vencimento: '2026-11-30',
      status: 'PENDENTE',
      metodoId: 904,
      dataRecebimento: null,
      observacao: 'Balcão',
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/financeiro/contas-receber']);
  });

  it('deve iniciar em modo de edição quando :id for informado, carregar dados via getContaReceberById (incluindo normalização de status PAGO -> RECEBIDO) e enviar PUT via updateContaReceber (T-023.1)', async () => {
    financeiroServiceMock.getContaReceberById.mockReturnValueOnce(
      of({ ...mockContaExistente, status: 'Pago' }),
    );
    await setupComponent('9301');

    expect(component.isEditMode()).toBe(true);
    expect(component.contaId()).toBe(9301);
    expect(financeiroServiceMock.getContaReceberById).toHaveBeenCalledWith(9301);
    expect(component.form.controls.descricao.value).toBe('Venda avulsa de capacete e luvas');
    expect(component.form.controls.vencimento.value).toBe('2026-11-25');
    expect(component.form.controls.valor.value).toBe(450.5);
    expect(component.form.controls.status.value).toBe('RECEBIDO');

    component.form.patchValue({
      descricao: 'Venda avulsa de capacete e luvas (Recebido)',
      status: 'RECEBIDO',
      dataRecebimento: '2026-11-16',
    });

    component.salvar();

    expect(financeiroServiceMock.updateContaReceber).toHaveBeenCalledWith(9301, {
      descricao: 'Venda avulsa de capacete e luvas (Recebido)',
      clienteId: 101,
      valor: 450.5,
      vencimento: '2026-11-25',
      status: 'RECEBIDO',
      metodoId: 904,
      dataRecebimento: '2026-11-16',
      observacao: 'Pagamento combinado para dia 25 via PIX',
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/financeiro/contas-receber']);
  });

  it('deve exibir erro amigável quando o parâmetro :id na rota de edição for inválido ou quando getContaReceberById falhar', async () => {
    await setupComponent('abc');

    expect(component.error()).toBe('Identificador de conta a receber inválido.');
    expect(financeiroServiceMock.getContaReceberById).not.toHaveBeenCalled();

    financeiroServiceMock.getContaReceberById.mockReturnValueOnce(
      throwError(() => new Error('404 Not Found')),
    );
    component.contaId.set(9999);
    component.carregarDados();
    fixture.detectChanges();

    expect(component.error()).toBe(
      'Não foi possível carregar os dados da conta a receber solicitada.',
    );
  });
});
