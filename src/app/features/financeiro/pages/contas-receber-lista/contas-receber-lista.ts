import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import {
  BaixaContaAlvo,
  Cliente,
  ContaReceberPagamentoResponse,
  FinanceiroContaReceber,
  FinanceiroMetodoPagamento,
} from '../../../../core/models';
import { ClientesService } from '../../../../core/services/clientes.service';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import {
  BaixaPagamentoModalComponent,
  BaixaPagamentoResult,
} from '../../components/baixa-pagamento-modal/baixa-pagamento-modal';

export type ContaReceberStatusEfetivo = 'PENDENTE' | 'VENCIDO' | 'RECEBIDO' | 'CANCELADO';
export type ContaReceberStatusFiltro = 'TODOS' | ContaReceberStatusEfetivo;

export interface ContaReceberKpi {
  label: string;
  valor: number;
  quantidade: number;
  tipo: 'entrada' | 'alerta' | 'recebido';
}

@Component({
  selector: 'app-contas-receber-lista',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink,
    BaixaPagamentoModalComponent,
  ],
  templateUrl: './contas-receber-lista.html',
  styleUrl: './contas-receber-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContasReceberListaComponent implements OnInit {
  readonly contas = signal<FinanceiroContaReceber[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly metodos = signal<FinanceiroMetodoPagamento[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly modalBaixaVisivel = signal<boolean>(false);
  readonly contaSelecionadaBaixa = signal<BaixaContaAlvo | null>(null);

  readonly statusFilter = signal<ContaReceberStatusFiltro>('TODOS');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');
  readonly searchTerm = signal<string>('');

  readonly first = signal<number>(0);
  readonly rows = 8;

  readonly statusOptions: { value: ContaReceberStatusFiltro; label: string }[] = [
    { value: 'TODOS', label: 'Todos os status' },
    { value: 'PENDENTE', label: 'Pendente (No prazo)' },
    { value: 'VENCIDO', label: 'Vencido (Em atraso)' },
    { value: 'RECEBIDO', label: 'Recebido' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  readonly hasActiveFilters = computed(
    () =>
      this.statusFilter() !== 'TODOS' ||
      this.dataInicio().trim() !== '' ||
      this.dataFim().trim() !== '' ||
      this.searchTerm().trim() !== '',
  );

  readonly periodoInvalido = computed(() => {
    const inicio = this.dataInicio().trim();
    const fim = this.dataFim().trim();
    return Boolean(inicio && fim && inicio > fim);
  });

  readonly filteredContas = computed<FinanceiroContaReceber[]>(() => {
    const lista = this.contas();
    const status = this.statusFilter();
    const inicio = this.dataInicio().trim();
    const fim = this.dataFim().trim();
    const termo = this.searchTerm().trim().toLowerCase();
    const todayKey = this.getTodayKey();
    // Referencia clientes() para reavaliar busca por nome quando carregados
    this.clientes();

    if (inicio && fim && inicio > fim) {
      return [];
    }

    return lista
      .filter((conta) => {
        const effectiveStatus = this.getEffectiveStatus(conta, todayKey);
        if (status !== 'TODOS' && effectiveStatus !== status) {
          return false;
        }

        const vencimentoKey = this.toDateKey(conta.vencimento);
        if (inicio && (!vencimentoKey || vencimentoKey < inicio)) {
          return false;
        }
        if (fim && (!vencimentoKey || vencimentoKey > fim)) {
          return false;
        }

        if (termo) {
          const descricao = (conta.descricao ?? '').toLowerCase();
          const observacao = (conta.observacao ?? '').toLowerCase();
          const clienteNome = this.getClienteNome(conta.clienteId).toLowerCase();
          const clienteIdStr = String(conta.clienteId ?? '');
          const osId = this.getOrdemServicoId(conta);
          const osLabel = osId !== null ? `os #${osId} os ${osId} ${osId}` : '';

          const matchesSearch =
            descricao.includes(termo) ||
            observacao.includes(termo) ||
            clienteNome.includes(termo) ||
            clienteIdStr.includes(termo) ||
            osLabel.includes(termo);

          if (!matchesSearch) {
            return false;
          }
        }

        return true;
      })
      .slice()
      .sort((a, b) => this.toDateKey(a.vencimento).localeCompare(this.toDateKey(b.vencimento)));
  });

  readonly paginatedContas = computed<FinanceiroContaReceber[]>(() => {
    const start = this.first();
    return this.filteredContas().slice(start, start + this.rows);
  });

  readonly pageEnd = computed<number>(() => {
    const total = this.filteredContas().length;
    const end = this.first() + this.rows;
    return end > total ? total : end;
  });

  readonly kpis = computed<ContaReceberKpi[]>(() => {
    const lista = this.contas();
    const todayKey = this.getTodayKey();

    const emAberto = lista.filter((c) => {
      const st = this.getEffectiveStatus(c, todayKey);
      return st === 'PENDENTE' || st === 'VENCIDO';
    });
    const vencidas = lista.filter((c) => this.getEffectiveStatus(c, todayKey) === 'VENCIDO');
    const recebidas = lista.filter((c) => this.getEffectiveStatus(c, todayKey) === 'RECEBIDO');

    return [
      {
        label: 'A receber (em aberto)',
        valor: emAberto.reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
        quantidade: emAberto.length,
        tipo: 'entrada',
      },
      {
        label: 'Recebíveis vencidos',
        valor: vencidas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
        quantidade: vencidas.length,
        tipo: 'alerta',
      },
      {
        label: 'Total recebido',
        valor: recebidas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
        quantidade: recebidas.length,
        tipo: 'recebido',
      },
    ];
  });

  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly clientesService: ClientesService,
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      contas: this.financeiroService.contasReceber(),
      clientes: this.clientesService.list().pipe(catchError(() => of([]))),
      metodos: this.financeiroService.metodos().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ contas, clientes, metodos }) => {
        this.contas.set(this.extractArray<FinanceiroContaReceber>(contas));
        this.clientes.set(this.extractArray<Cliente>(clientes));
        this.metodos.set(this.extractArray<FinanceiroMetodoPagamento>(metodos));
        this.first.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar a lista de contas a receber.');
        this.loading.set(false);
      },
    });
  }

  setStatusFilter(status: ContaReceberStatusFiltro): void {
    this.statusFilter.set(status);
    this.first.set(0);
  }

  setDataInicio(data: string): void {
    this.dataInicio.set(data ?? '');
    this.first.set(0);
  }

  setDataFim(data: string): void {
    this.dataFim.set(data ?? '');
    this.first.set(0);
  }

  setSearchTerm(termo: string): void {
    this.searchTerm.set(termo ?? '');
    this.first.set(0);
  }

  limparFiltros(): void {
    this.statusFilter.set('TODOS');
    this.dataInicio.set('');
    this.dataFim.set('');
    this.searchTerm.set('');
    this.first.set(0);
  }

  prevPage(): void {
    this.first.update((curr) => Math.max(0, curr - this.rows));
  }

  nextPage(): void {
    const total = this.filteredContas().length;
    this.first.update((curr) => (curr + this.rows < total ? curr + this.rows : curr));
  }

  getOrdemServicoId(conta: FinanceiroContaReceber): number | null {
    if (
      conta.ordemServicoId !== undefined &&
      conta.ordemServicoId !== null &&
      Number.isInteger(Number(conta.ordemServicoId)) &&
      Number(conta.ordemServicoId) > 0
    ) {
      return Number(conta.ordemServicoId);
    }

    const osPattern = /\bOS\s*#?\s*(\d+)\b/i;
    const descMatch = osPattern.exec(conta.descricao ?? '');
    if (descMatch) {
      const parsed = Number(descMatch[1]);
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    const obsMatch = osPattern.exec(conta.observacao ?? '');
    if (obsMatch) {
      const parsed = Number(obsMatch[1]);
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }

  getEffectiveStatus(
    conta: FinanceiroContaReceber,
    todayKey: string = this.getTodayKey(),
  ): ContaReceberStatusEfetivo {
    const raw = (conta.status ?? '').trim().toUpperCase();
    if (raw === 'RECEBIDO' || raw === 'PAGO' || raw === 'LIQUIDADO') {
      return 'RECEBIDO';
    }
    if (raw === 'CANCELADO') {
      return 'CANCELADO';
    }
    if (raw === 'VENCIDO') {
      return 'VENCIDO';
    }

    const vencimentoKey = this.toDateKey(conta.vencimento);
    if (!conta.dataRecebimento && vencimentoKey !== '' && vencimentoKey < todayKey) {
      return 'VENCIDO';
    }

    return 'PENDENTE';
  }

  isVencida(conta: FinanceiroContaReceber): boolean {
    return this.getEffectiveStatus(conta) === 'VENCIDO';
  }

  podeBaixar(conta: FinanceiroContaReceber): boolean {
    const st = this.getEffectiveStatus(conta);
    return st === 'PENDENTE' || st === 'VENCIDO';
  }

  abrirModalBaixa(conta: FinanceiroContaReceber): void {
    if (!this.podeBaixar(conta)) {
      return;
    }
    this.contaSelecionadaBaixa.set({
      id: conta.id,
      tipo: 'RECEBER',
      descricao: conta.descricao,
      valor: conta.valor,
      vencimento: conta.vencimento,
      metodoId: conta.metodoId,
      parceiroNome: this.getClienteNome(conta.clienteId),
      observacao: conta.observacao,
    });
    this.modalBaixaVisivel.set(true);
  }

  onVisibleBaixaChange(visivel: boolean): void {
    this.modalBaixaVisivel.set(visivel);
    if (!visivel) {
      this.contaSelecionadaBaixa.set(null);
    }
  }

  onBaixaRegistrada(resultado: BaixaPagamentoResult): void {
    const resp = resultado as ContaReceberPagamentoResponse;
    if (resp?.conta) {
      this.contas.update((lista) =>
        lista.map((item) => (item.id === resp.conta.id ? { ...item, ...resp.conta } : item)),
      );
    }
    this.onVisibleBaixaChange(false);
  }

  getStatusLabel(conta: FinanceiroContaReceber): string {
    const status = this.getEffectiveStatus(conta);
    switch (status) {
      case 'VENCIDO':
        return 'Vencido';
      case 'RECEBIDO':
        return 'Recebido';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  }

  getClienteNome(clienteId: number | null): string {
    if (!clienteId) {
      return '-';
    }
    const found = this.clientes().find((c) => c.id === clienteId);
    if (found) {
      return found.nomeExibicao || found.nome || `Cliente #${clienteId}`;
    }
    return `Cliente #${clienteId}`;
  }

  getMetodoNome(metodoId: number | null): string {
    if (!metodoId) {
      return '-';
    }
    const found = this.metodos().find((m) => m.id === metodoId);
    return found?.nome || `Método #${metodoId}`;
  }

  toDateKey(dateValue: string | null | undefined): string {
    if (!dateValue) {
      return '';
    }
    const trimmed = dateValue.trim();
    const isoPrefixMatch = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
    if (isoPrefixMatch) {
      return isoPrefixMatch[1];
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    return this.formatLocalDateKey(parsed);
  }

  private getTodayKey(): string {
    return this.formatLocalDateKey(new Date());
  }

  private formatLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private extractArray<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }
    if (response && typeof response === 'object' && Array.isArray((response as { data?: unknown }).data)) {
      return (response as { data: T[] }).data;
    }
    return [];
  }
}
