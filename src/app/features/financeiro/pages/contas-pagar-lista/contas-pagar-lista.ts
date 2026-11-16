import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import {
  FinanceiroContaPagar,
  FinanceiroMetodoPagamento,
  Fornecedor,
} from '../../../../core/models';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';

export type ContaPagarStatusEfetivo = 'PENDENTE' | 'VENCIDO' | 'PAGO' | 'CANCELADO';
export type ContaPagarStatusFiltro = 'TODOS' | ContaPagarStatusEfetivo;

export interface ContaPagarKpi {
  label: string;
  valor: number;
  quantidade: number;
  tipo: 'saida' | 'alerta' | 'pago';
}

@Component({
  selector: 'app-contas-pagar-lista',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './contas-pagar-lista.html',
  styleUrl: './contas-pagar-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContasPagarListaComponent implements OnInit {
  readonly contas = signal<FinanceiroContaPagar[]>([]);
  readonly fornecedores = signal<Fornecedor[]>([]);
  readonly metodos = signal<FinanceiroMetodoPagamento[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly statusFilter = signal<ContaPagarStatusFiltro>('TODOS');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');
  readonly searchTerm = signal<string>('');

  readonly first = signal<number>(0);
  readonly rows = 8;

  readonly statusOptions: { value: ContaPagarStatusFiltro; label: string }[] = [
    { value: 'TODOS', label: 'Todos os status' },
    { value: 'PENDENTE', label: 'Pendente (No prazo)' },
    { value: 'VENCIDO', label: 'Vencido (Em atraso)' },
    { value: 'PAGO', label: 'Pago' },
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

  readonly filteredContas = computed<FinanceiroContaPagar[]>(() => {
    const lista = this.contas();
    const status = this.statusFilter();
    const inicio = this.dataInicio().trim();
    const fim = this.dataFim().trim();
    const termo = this.searchTerm().trim().toLowerCase();
    const todayKey = this.getTodayKey();
    // Referencia fornecedores() para reavaliar busca por nome quando carregados
    this.fornecedores();

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
          const fornecedorNome = this.getFornecedorNome(conta.fornecedorId).toLowerCase();
          const fornecedorIdStr = String(conta.fornecedorId ?? '');
          const matchesSearch =
            descricao.includes(termo) ||
            observacao.includes(termo) ||
            fornecedorNome.includes(termo) ||
            fornecedorIdStr.includes(termo);

          if (!matchesSearch) {
            return false;
          }
        }

        return true;
      })
      .slice()
      .sort((a, b) => this.toDateKey(a.vencimento).localeCompare(this.toDateKey(b.vencimento)));
  });

  readonly paginatedContas = computed<FinanceiroContaPagar[]>(() => {
    const start = this.first();
    return this.filteredContas().slice(start, start + this.rows);
  });

  readonly pageEnd = computed<number>(() => {
    const total = this.filteredContas().length;
    const end = this.first() + this.rows;
    return end > total ? total : end;
  });

  readonly kpis = computed<ContaPagarKpi[]>(() => {
    const lista = this.contas();
    const todayKey = this.getTodayKey();

    const emAberto = lista.filter((c) => {
      const st = this.getEffectiveStatus(c, todayKey);
      return st === 'PENDENTE' || st === 'VENCIDO';
    });
    const vencidas = lista.filter((c) => this.getEffectiveStatus(c, todayKey) === 'VENCIDO');
    const pagas = lista.filter((c) => this.getEffectiveStatus(c, todayKey) === 'PAGO');

    return [
      {
        label: 'A pagar (em aberto)',
        valor: emAberto.reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
        quantidade: emAberto.length,
        tipo: 'saida',
      },
      {
        label: 'Contas vencidas',
        valor: vencidas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
        quantidade: vencidas.length,
        tipo: 'alerta',
      },
      {
        label: 'Total pago',
        valor: pagas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
        quantidade: pagas.length,
        tipo: 'pago',
      },
    ];
  });

  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly fornecedoresService: FornecedoresService,
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      contas: this.financeiroService.contasPagar(),
      fornecedores: this.fornecedoresService.list().pipe(catchError(() => of([]))),
      metodos: this.financeiroService.metodos().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ contas, fornecedores, metodos }) => {
        this.contas.set(this.extractArray<FinanceiroContaPagar>(contas));
        this.fornecedores.set(this.extractArray<Fornecedor>(fornecedores));
        this.metodos.set(this.extractArray<FinanceiroMetodoPagamento>(metodos));
        this.first.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar a lista de contas a pagar.');
        this.loading.set(false);
      },
    });
  }

  setStatusFilter(status: ContaPagarStatusFiltro): void {
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

  getEffectiveStatus(
    conta: FinanceiroContaPagar,
    todayKey: string = this.getTodayKey(),
  ): ContaPagarStatusEfetivo {
    const raw = (conta.status ?? '').trim().toUpperCase();
    if (raw === 'PAGO') {
      return 'PAGO';
    }
    if (raw === 'CANCELADO') {
      return 'CANCELADO';
    }
    if (raw === 'VENCIDO') {
      return 'VENCIDO';
    }

    const vencimentoKey = this.toDateKey(conta.vencimento);
    if (!conta.dataPagamento && vencimentoKey !== '' && vencimentoKey < todayKey) {
      return 'VENCIDO';
    }

    return 'PENDENTE';
  }

  isVencida(conta: FinanceiroContaPagar): boolean {
    return this.getEffectiveStatus(conta) === 'VENCIDO';
  }

  getStatusLabel(conta: FinanceiroContaPagar): string {
    const status = this.getEffectiveStatus(conta);
    switch (status) {
      case 'VENCIDO':
        return 'Vencido';
      case 'PAGO':
        return 'Pago';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  }

  getFornecedorNome(fornecedorId: number | null): string {
    if (!fornecedorId) {
      return '-';
    }
    const found = this.fornecedores().find((f) => f.id === fornecedorId);
    if (found) {
      return found.nomeFantasia || found.razaoSocial || `Fornecedor #${fornecedorId}`;
    }
    return `Fornecedor #${fornecedorId}`;
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

  getTodayKey(referenceDate: Date = new Date()): string {
    return this.formatLocalDateKey(referenceDate);
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

export { ContasPagarListaComponent as ContasPagarLista };
