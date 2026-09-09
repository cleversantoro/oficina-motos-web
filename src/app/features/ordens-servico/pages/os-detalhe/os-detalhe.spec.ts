import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { OsDetalheComponent } from './os-detalhe';
import { OrdensService } from '../../../../core/services/ordens.service';
import { ClientesService } from '../../../../core/services/clientes.service';
import { VeiculosService } from '../../../../core/services/veiculos.service';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { Toast } from '../../../../shared/services/toast';
import { OrdemServico } from '../../../../core/models';

describe('OsDetalheComponent', () => {
  let fixture: ComponentFixture<OsDetalheComponent>;
  let component: OsDetalheComponent;
  let ordensGetSubject: Subject<OrdemServico>;
  let ordensUpdateSubject: Subject<any>;
  let clientesGetSubject: Subject<any>;
  let veiculosGetSubject: Subject<any>;
  let mecanicosGetSubject: Subject<any>;
  let toastSuccesses: string[];
  let toastErrors: string[];

  const mockOrdemAberta: OrdemServico = {
    id: 1,
    clienteId: 10,
    veiculoId: 20,
    mecanicoId: 30,
    descricaoProblema: 'Troca de pastilhas de freio',
    status: 'Aberta',
    dataAbertura: '2026-09-08T10:00:00Z',
    dataConclusao: null,
    itens: [
      { id: 101, ordemServicoId: 1, pecaId: 1, descricao: 'Pastilha Dianteira', quantidade: 2, valorUnitario: 50, total: 100 },
      { id: 102, ordemServicoId: 1, pecaId: null, descricao: 'Mão de obra', quantidade: 1, valorUnitario: 80, total: 80 },
    ],
    observacoes: [
      { id: 201, ordemServicoId: 1, usuario: 'Atendente João', texto: 'Cliente solicitou conferência de pneus' },
    ],
    pagamentos: [
      { id: 301, ordemServicoId: 1, valor: 50, status: 'Aprovado', metodo: 'PIX', dataPagamento: '2026-09-08', observacao: null },
    ],
  };

  const setupTestBed = async (routeId: string | null = '1') => {
    ordensGetSubject = new Subject<OrdemServico>();
    ordensUpdateSubject = new Subject<any>();
    clientesGetSubject = new Subject<any>();
    veiculosGetSubject = new Subject<any>();
    mecanicosGetSubject = new Subject<any>();
    toastSuccesses = [];
    toastErrors = [];

    await TestBed.configureTestingModule({
      imports: [OsDetalheComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(routeId !== null ? { id: routeId } : {}),
            },
          },
        },
        {
          provide: OrdensService,
          useValue: {
            get: () => ordensGetSubject.asObservable(),
            update: () => ordensUpdateSubject.asObservable(),
          },
        },
        {
          provide: ClientesService,
          useValue: {
            get: () => clientesGetSubject.asObservable(),
          },
        },
        {
          provide: VeiculosService,
          useValue: {
            get: () => veiculosGetSubject.asObservable(),
          },
        },
        {
          provide: MecanicosService,
          useValue: {
            get: () => mecanicosGetSubject.asObservable(),
          },
        },
        {
          provide: Toast,
          useValue: {
            success: (_title: string, msg: string) => toastSuccesses.push(msg),
            error: (_title: string, msg: string) => toastErrors.push(msg),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OsDetalheComponent);
    component = fixture.componentInstance;
  };

  describe('Inicialização e Carregamento', () => {
    it('deve identificar ID inválido na rota e definir erro', async () => {
      await setupTestBed('invalido');
      component.ngOnInit();

      expect(component.error()).toBe('Identificador de ordem inválido.');
      expect(component.loading()).toBe(false);
    });

    it('deve carregar dados da OS com sucesso e disparar resolução de entidades', async () => {
      await setupTestBed('1');
      component.ngOnInit();

      expect(component.loading()).toBe(true);

      ordensGetSubject.next(mockOrdemAberta);

      expect(component.loading()).toBe(false);
      expect(component.ordem()).toEqual(mockOrdemAberta);
      expect(component.statusLabel()).toBe('Aberta');
      expect(component.statusSeverity()).toBe('info');
      expect(component.isTerminal()).toBe(false);
    });

    it('deve tratar erro 404 ao carregar OS', async () => {
      await setupTestBed('999');
      component.ngOnInit();

      ordensGetSubject.error(new Error('404'));

      expect(component.loading()).toBe(false);
      expect(component.error()).toContain('não encontrada');
    });
  });

  describe('Resolução de Cliente, Veículo e Mecânico (US1)', () => {
    beforeEach(async () => {
      await setupTestBed('1');
      component.ngOnInit();
      ordensGetSubject.next(mockOrdemAberta);
    });

    it('deve armazenar dados resolvidos do cliente', () => {
      clientesGetSubject.next({ id: 10, nome: 'Carlos Silva', telefone: '11999998888', documento: '12345678901' });
      expect(component.cliente()?.nome).toBe('Carlos Silva');
    });

    it('deve armazenar dados resolvidos do veículo', () => {
      veiculosGetSubject.next({ id: 20, placa: 'BRA2E19', cor: 'Azul', anoMod: 2024 });
      expect(component.veiculo()?.placa).toBe('BRA2E19');
    });

    it('deve formatar nome do mecânico corretamente', () => {
      mecanicosGetSubject.next({ id: 30, nome: 'Marcos', sobrenome: 'Santos' });
      expect(component.mecanicoNome()).toBe('Marcos Santos');
    });
  });

  describe('Controle de Transições de Status (US2)', () => {
    beforeEach(async () => {
      await setupTestBed('1');
      component.ngOnInit();
    });

    it('deve calcular transições válidas a partir de Aberta: EmAndamento e Cancelada', () => {
      ordensGetSubject.next(mockOrdemAberta);
      expect(component.transicoesValidas()).toEqual(['EmAndamento', 'Cancelada']);
    });

    it('deve calcular transições válidas a partir de EmAndamento: AguardandoPeca, Concluida, Cancelada', () => {
      ordensGetSubject.next({ ...mockOrdemAberta, status: 'EmAndamento' });
      expect(component.transicoesValidas()).toEqual(['AguardandoPeca', 'Concluida', 'Cancelada']);
    });

    it('deve calcular transições válidas a partir de AguardandoPeca: EmAndamento e Cancelada', () => {
      ordensGetSubject.next({ ...mockOrdemAberta, status: 'AguardandoPeca' });
      expect(component.transicoesValidas()).toEqual(['EmAndamento', 'Cancelada']);
    });

    it('deve identificar Concluida e Cancelada como terminais sem transições', () => {
      ordensGetSubject.next({ ...mockOrdemAberta, status: 'Concluida' });
      expect(component.isTerminal()).toBe(true);
      expect(component.transicoesValidas()).toEqual([]);

      ordensGetSubject.next({ ...mockOrdemAberta, status: 'Cancelada' });
      expect(component.isTerminal()).toBe(true);
      expect(component.transicoesValidas()).toEqual([]);
    });

    it('deve atualizar status com sucesso e exibir toast', () => {
      ordensGetSubject.next(mockOrdemAberta);
      component.alterarStatus('EmAndamento');

      expect(component.submittingStatus()).toBe(true);

      ordensUpdateSubject.next({ ...mockOrdemAberta, status: 'EmAndamento' });

      expect(component.submittingStatus()).toBe(false);
      expect(component.ordem()?.status).toBe('EmAndamento');
      expect(toastSuccesses.length).toBe(1);
    });

    it('deve rejeitar transições não permitidas', () => {
      ordensGetSubject.next(mockOrdemAberta); // Status Aberta
      component.alterarStatus('Concluida'); // Não é permitida direto de Aberta

      expect(toastErrors.length).toBe(1);
      expect(component.ordem()?.status).toBe('Aberta');
    });
  });

  describe('Cálculos e Listagem de Itens da OS (US3)', () => {
    beforeEach(async () => {
      await setupTestBed('1');
      component.ngOnInit();
    });

    it('deve calcular a soma total dos itens', () => {
      ordensGetSubject.next(mockOrdemAberta);
      // Item 1: 100, Item 2: 80 => Total 180
      expect(component.totalItens()).toBe(180);
    });

    it('deve retornar 0 quando a OS não possuir itens', () => {
      ordensGetSubject.next({ ...mockOrdemAberta, itens: [] });
      expect(component.totalItens()).toBe(0);
    });
  });

  describe('Cálculos Financeiros e Pagamentos (US5)', () => {
    beforeEach(async () => {
      await setupTestBed('1');
      component.ngOnInit();
    });

    it('deve calcular o total pago e saldo pendente', () => {
      ordensGetSubject.next(mockOrdemAberta);
      // Total itens = 180, Pagamento = 50 => Saldo pendente = 130
      expect(component.totalPago()).toBe(50);
      expect(component.saldoPendente()).toBe(130);
    });

    it('saldo pendente deve ser 0 quando totalmente pago', () => {
      const ordemPaga: OrdemServico = {
        ...mockOrdemAberta,
        pagamentos: [
          { id: 301, ordemServicoId: 1, valor: 180, status: 'Aprovado', metodo: 'Cartão', dataPagamento: '2026-09-08', observacao: null },
        ],
      };
      ordensGetSubject.next(ordemPaga);
      expect(component.totalPago()).toBe(180);
      expect(component.saldoPendente()).toBe(0);
    });
  });
});
