import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { Fornecedor } from '../../../../core/models/fornecedor';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import {
  DatatableAction,
  DatatableColumn,
  DatatableComponent,
} from '../../../../shared/ui/datatable';

export type FornecedorStatusFilter = 'TODOS' | 'ATIVO' | 'INATIVO' | 'SUSPENSO';
export type FornecedorTableRow = Fornecedor & Record<string, unknown>;

@Component({
  selector: 'app-fornecedor-lista',
  imports: [DecimalPipe, FormsModule, RouterLink, DatatableComponent],
  templateUrl: './fornecedor-lista.html',
  styleUrl: './fornecedor-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FornecedorLista implements OnInit {
  @ViewChild('fornecedorTpl', { static: true })
  fornecedorTpl?: TemplateRef<{ $implicit: FornecedorTableRow }>;
  @ViewChild('contatoTpl', { static: true })
  contatoTpl?: TemplateRef<{ $implicit: FornecedorTableRow }>;
  @ViewChild('scoreTpl', { static: true })
  scoreTpl?: TemplateRef<{ $implicit: FornecedorTableRow }>;
  @ViewChild('statusTpl', { static: true })
  statusTpl?: TemplateRef<{ $implicit: FornecedorTableRow }>;

  private readonly svc = inject(FornecedoresService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly confirmation = inject(Confirmation);
  private readonly toast = inject(Toast);

  columns: DatatableColumn<FornecedorTableRow>[] = [];

  readonly actions: readonly DatatableAction<FornecedorTableRow>[] = [
    {
      id: 'view',
      icon: 'fa-solid fa-eye',
      label: 'Visualizar',
      variant: 'view',
      onClick: (f) => this.openDetalhe(f.id),
    },
    {
      id: 'delete',
      icon: 'fa-solid fa-trash',
      label: 'Excluir',
      variant: 'delete',
      visible: () => this.canDeleteFornecedor(),
      disabled: (f) => this.deletingId() === f.id,
      onClick: (f) => {
        void this.confirmDelete(f);
      },
    },
  ];

  readonly fornecedores = signal<Fornecedor[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filterText = signal('');
  readonly statusFilter = signal<FornecedorStatusFilter>('TODOS');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly deletingId = signal<number | null>(null);

  readonly statusOptions: ReadonlyArray<{ label: string; value: FornecedorStatusFilter }> = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Ativos', value: 'ATIVO' },
    { label: 'Inativos', value: 'INATIVO' },
    { label: 'Suspensos', value: 'SUSPENSO' },
  ];

  readonly pageSizeOptions: readonly number[] = [5, 10, 20];

  readonly canDeleteFornecedor = computed(() =>
    canPerformBusinessAction(this.authService.currentRole(), 'fornecedores', 'delete'),
  );

  readonly totalFornecedores = computed(() => this.fornecedores().length);

  readonly totalAtivos = computed(
    () => this.fornecedores().filter((f) => f.status?.toUpperCase() === 'ATIVO').length,
  );

  readonly totalInativosOuSuspensos = computed(
    () =>
      this.fornecedores().filter((f) => {
        const st = f.status?.toUpperCase();
        return st === 'INATIVO' || st === 'SUSPENSO';
      }).length,
  );

  readonly notaMediaGeral = computed(() => {
    const avaliados = this.fornecedores().filter(
      (f): f is Fornecedor & { notaMedia: number } =>
        f.notaMedia !== null && f.notaMedia !== undefined,
    );
    if (avaliados.length === 0) return null;
    const soma = avaliados.reduce((acc, f) => acc + Number(f.notaMedia), 0);
    return soma / avaliados.length;
  });

  readonly filtered = computed(() => {
    const q = this.filterText().trim().toLowerCase();
    const status = this.statusFilter();

    return this.fornecedores().filter((f) => {
      const matchesStatus =
        status === 'TODOS' || f.status?.toUpperCase() === status;
      if (!matchesStatus) return false;

      if (!q) return true;
      return (
        f.razaoSocial?.toLowerCase().includes(q) ||
        f.nomeFantasia?.toLowerCase().includes(q) ||
        f.documento?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.telefonePrincipal?.toLowerCase().includes(q)
      );
    });
  });

  readonly paginated = computed(() => {
    const start = this.first();
    return this.filtered().slice(start, start + this.rows());
  });

  readonly hasActiveFilters = computed(
    () => this.filterText().trim().length > 0 || this.statusFilter() !== 'TODOS',
  );

  readonly rangeStart = computed(() => (this.filtered().length === 0 ? 0 : this.first() + 1));

  readonly rangeEnd = computed(() =>
    Math.min(this.first() + this.rows(), this.filtered().length),
  );

  readonly isFirstPage = computed(() => this.first() === 0);

  readonly isLastPage = computed(
    () => this.first() + this.rows() >= this.filtered().length,
  );

  readonly tableRows = computed<FornecedorTableRow[]>(() =>
    this.filtered().map((f) => ({ ...f })),
  );

  ngOnInit(): void {
    this.columns = [
      { field: 'razaoSocial', header: 'Fornecedor', subField: 'nomeFantasia', cellTemplate: this.fornecedorTpl },
      { field: 'documento', header: 'CNPJ' },
      { field: 'email', header: 'Contato', subField: 'telefonePrincipal', cellTemplate: this.contatoTpl },
      { field: 'notaMedia', header: 'Score', cellTemplate: this.scoreTpl },
      { field: 'status', header: 'Status', cellTemplate: this.statusTpl },
    ];
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list().subscribe({
      next: (data: unknown) => {
        this.fornecedores.set(Array.isArray(data) ? (data as Fornecedor[]) : []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar a lista de fornecedores.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.filterText.set(value);
    this.reset();
  }

  setStatusFilter(status: FornecedorStatusFilter): void {
    this.statusFilter.set(status);
    this.reset();
  }

  onRowsChange(newRows: number): void {
    this.rows.set(Number(newRows) || 10);
    this.reset();
  }

  clearFilters(): void {
    this.filterText.set('');
    this.statusFilter.set('TODOS');
    this.reset();
  }

  openDetalhe(id: number): void {
    this.router.navigate(['/fornecedores', id]);
  }

  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ATIVO':
        return 'pill-success';
      case 'INATIVO':
        return 'pill-danger';
      case 'SUSPENSO':
        return 'pill-warning';
      default:
        return 'pill-neutral';
    }
  }

  starsOf(nota: number | null): string {
    const n = Math.max(0, Math.min(5, Math.round(nota ?? 0)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  displayName(f: Fornecedor): string {
    return f.nomeFantasia || f.razaoSocial;
  }

  next(): void {
    if (!this.isLastPage()) {
      this.first.update((v) => v + this.rows());
    }
  }

  prev(): void {
    if (!this.isFirstPage()) {
      this.first.update((v) => Math.max(0, v - this.rows()));
    }
  }

  reset(): void {
    this.first.set(0);
  }

  async confirmDelete(fornecedor: Fornecedor | number): Promise<void> {
    const id = typeof fornecedor === 'number' ? fornecedor : fornecedor.id;
    const nome =
      typeof fornecedor === 'number'
        ? `Fornecedor #${id}`
        : this.displayName(fornecedor);

    if (this.deletingId() !== null) return;

    const confirmado = await this.confirmation.confirmDelete(nome);
    if (!confirmado) return;

    this.deletingId.set(id);
    this.svc.delete(id).subscribe({
      next: () => {
        this.fornecedores.update((lista) => lista.filter((f) => f.id !== id));
        if (this.first() >= this.filtered().length && this.first() > 0) {
          this.first.update((v) => Math.max(0, v - this.rows()));
        }
        this.deletingId.set(null);
        this.toast.success('Fornecedor excluído', `"${nome}" foi removido com sucesso.`);
      },
      error: () => {
        this.deletingId.set(null);
        this.toast.error('Erro ao excluir', 'Não foi possível excluir o fornecedor.');
      },
    });
  }
}
