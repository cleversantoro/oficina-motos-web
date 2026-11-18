import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../../../app.routes';
import { FinanceiroContaPagar } from '../../../../core/models';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { Toast } from '../../../../shared/services/toast';
import { ContasPagarFormComponent } from './contas-pagar-form';

describe('ContasPagarFormComponent (US-021)', () => {
  let fixture: ComponentFixture<ContasPagarFormComponent>;
  let component: ContasPagarFormComponent;
  let router: Router;
  let routeId: string | null = null;

  const mockContaExistente: FinanceiroContaPagar = {
    id: 9201,
    fornecedorId: 301,
    descricao: 'Compra de filtros de óleo Bosch',
    valor: 580.5,
    vencimento: '2026-11-25T00:00:00',
    status: 'PENDENTE',
    dataPagamento: null,
    metodoId: 904,
    observacao: 'Prazo 10 dias via PIX',
  };

  const mockFornecedores = [
    { id: 301, nomeFantasia: 'AutoParts Bosch', razaoSocial: 'Bosch Ltda' },
    { id: 302, nomeFantasia: 'Monroe Suspensões', razaoSocial: 'Monroe SA' },
  ];

  const mockMetodos = [
    { id: 902, nome: 'Cartão de Crédito', descricao: null },
    { id: 904, nome: 'PIX', descricao: null },
  ];

  const financeiroServiceMock = {
    getContaPagarById: vi.fn(),
    createContaPagar: vi.fn(),
    updateContaPagar: vi.fn(),
    metodos: vi.fn(),
  };

  const fornecedoresServiceMock = {
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
      imports: [ContasPagarFormComponent],
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
        { provide: FornecedoresService, useValue: fornecedoresServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ContasPagarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    financeiroServiceMock.getContaPagarById.mockReturnValue(of(mockContaExistente));
    financeiroServiceMock.createContaPagar.mockImplementation((payload) =>
      of({ id: 9300, ...payload }),
    );
    financeiroServiceMock.updateContaPagar.mockImplementation((id, payload) =>
      of({ id: Number(id), ...payload }),
    );
    financeiroServiceMock.metodos.mockReturnValue(of(mockMetodos));
    fornecedoresServiceMock.list.mockReturnValue(of(mockFornecedores));
  });

  it('deve registrar as rotas de criação (/financeiro/contas-pagar/novo) e edição (/financeiro/contas-pagar/:id/editar) em app.routes.ts (T-021.2)', async () => {
    const mainRoute = routes.find((r) => r.path === '' && Array.isArray(r.children));
    expect(mainRoute).toBeTruthy();

    const createRoute = mainRoute?.children?.find(
      (c) => c.path === 'financeiro/contas-pagar/novo',
    );
    const editRoute = mainRoute?.children?.find(
      (c) => c.path === 'financeiro/contas-pagar/:id/editar',
    );

    expect(createRoute).toBeTruthy();
    expect(createRoute?.component ?? (await createRoute?.loadComponent?.())).toBe(ContasPagarFormComponent);
    expect(editRoute).toBeTruthy();
    expect(editRoute?.component ?? (await editRoute?.loadComponent?.())).toBe(ContasPagarFormComponent);
  });

  it('deve iniciar em modo de criação quando não houver parâmetro :id e carregar fornecedores e métodos (T-021.1)', async () => {
    await setupComponent(null);

    expect(component.isEditMode()).toBe(false);
    expect(component.contaId()).toBeNull();
    expect(financeiroServiceMock.getContaPagarById).not.toHaveBeenCalled();
    expect(fornecedoresServiceMock.list).toHaveBeenCalledTimes(1);
    expect(financeiroServiceMock.metodos).toHaveBeenCalledTimes(1);
    expect(component.form.controls.status.value).toBe('PENDENTE');

    const title = fixture.nativeElement.querySelector('h1');
    expect(title?.textContent).toContain('Nova Conta a Pagar');
  });

  it('deve validar campos obrigatórios e impedir envio inválido em modo de criação (T-021.1)', async () => {
    await setupComponent(null);

    component.salvar();
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
    expect(financeiroServiceMock.createContaPagar).not.toHaveBeenCalled();

    const errors = fixture.nativeElement.querySelectorAll('.field-error');
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('deve enviar POST via createContaPagar e navegar para /financeiro/contas-pagar ao salvar nova conta válida (T-021.1, T-021.3)', async () => {
    await setupComponent(null);

    component.form.patchValue({
      descricao: '  Compra de kit relação DID  ',
      fornecedorId: 301,
      valor: 1250.5,
      vencimento: '2026-11-30',
      status: 'PENDENTE',
      metodoId: 904,
      dataPagamento: '',
      observacao: '  NF 45892  ',
    });

    component.salvar();

    expect(financeiroServiceMock.createContaPagar).toHaveBeenCalledWith({
      descricao: 'Compra de kit relação DID',
      fornecedorId: 301,
      valor: 1250.5,
      vencimento: '2026-11-30',
      status: 'PENDENTE',
      metodoId: 904,
      dataPagamento: null,
      observacao: 'NF 45892',
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/financeiro/contas-pagar']);
  });

  it('deve iniciar em modo de edição quando :id for informado, carregar dados via getContaPagarById e enviar PUT via updateContaPagar (T-021.1, T-021.3)', async () => {
    await setupComponent('9201');

    expect(component.isEditMode()).toBe(true);
    expect(component.contaId()).toBe(9201);
    expect(financeiroServiceMock.getContaPagarById).toHaveBeenCalledWith(9201);
    expect(component.form.controls.descricao.value).toBe('Compra de filtros de óleo Bosch');
    expect(component.form.controls.vencimento.value).toBe('2026-11-25');
    expect(component.form.controls.valor.value).toBe(580.5);

    component.form.patchValue({
      descricao: 'Compra de filtros de óleo Bosch (Quitado)',
      status: 'PAGO',
      dataPagamento: '2026-11-16',
    });

    component.salvar();

    expect(financeiroServiceMock.updateContaPagar).toHaveBeenCalledWith(9201, {
      descricao: 'Compra de filtros de óleo Bosch (Quitado)',
      fornecedorId: 301,
      valor: 580.5,
      vencimento: '2026-11-25',
      status: 'PAGO',
      metodoId: 904,
      dataPagamento: '2026-11-16',
      observacao: 'Prazo 10 dias via PIX',
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/financeiro/contas-pagar']);
  });

  it('deve exibir erro amigável quando o parâmetro :id na rota de edição for inválido ou quando getContaPagarById falhar', async () => {
    await setupComponent('abc');

    expect(component.error()).toBe('Identificador de conta a pagar inválido.');
    expect(financeiroServiceMock.getContaPagarById).not.toHaveBeenCalled();

    financeiroServiceMock.getContaPagarById.mockReturnValueOnce(
      throwError(() => new Error('404 Not Found')),
    );
    component.contaId.set(9999);
    component.carregarDados();
    fixture.detectChanges();

    expect(component.error()).toBe(
      'Não foi possível carregar os dados da conta a pagar solicitada.',
    );
  });
});
