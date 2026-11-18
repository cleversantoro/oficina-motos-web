import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DatatableAction,
  DatatableColumn,
  DatatableSortDirection,
  DatatableSortState,
  DatatableStatusOption,
} from './datatable.models';

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './datatable.html',
  styleUrl: './datatable.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatatableComponent<T extends Record<string, unknown> = Record<string, unknown>> {
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  readonly data = input<readonly T[]>([]);
  readonly columns = input<readonly DatatableColumn<T>[]>([]);
  readonly actions = input<readonly DatatableAction<T>[]>([]);
  readonly loading = input(false);
  readonly selectable = input(true);
  readonly exportable = input(false);
  readonly rowKey = input<keyof T | string>('id');
  readonly searchPlaceholder = input('Buscar...');
  readonly emptyTitle = input('Nenhum registro encontrado');
  readonly emptyDescription = input('Não encontramos registros correspondentes aos filtros atuais.');
  readonly statusField = input<keyof T | string | null>(null);
  readonly statusOptions = input<readonly DatatableStatusOption[]>([]);
  readonly pageSizeOptions = input<readonly number[]>([5, 10, 20]);
  readonly initialPageSize = input(5);
  readonly initialSortColumn = input<string>('');
  readonly initialSortDirection = input<DatatableSortDirection>('asc');

  readonly rowClick = output<T>();
  readonly selectionChange = output<T[]>();
  readonly bulkDelete = output<T[]>();
  readonly sortChange = output<DatatableSortState>();

  readonly searchQuery = signal('');
  readonly statusFilter = signal('Todos');
  readonly sortColumn = signal('');
  readonly sortDirection = signal<DatatableSortDirection>('asc');
  readonly currentPage = signal(1);
  readonly pageSize = signal(5);
  readonly selectedKeys = signal<Set<string | number>>(new Set());

  constructor() {
    effect(() => {
      const initSize = this.initialPageSize();
      if (initSize > 0) {
        this.pageSize.set(initSize);
      }
    });

    effect(() => {
      const initCol = this.initialSortColumn();
      if (initCol && !this.sortColumn()) {
        this.sortColumn.set(initCol);
        this.sortDirection.set(this.initialSortDirection());
      }
    });
  }

  readonly processedData = computed<T[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const statusKey = this.statusField();
    const cols = this.columns();

    const filtered = this.data().filter((item) => {
      if (statusKey && status !== 'Todos') {
        const itemStatus = String(this.getNestedValue(item, String(statusKey)) ?? '');
        if (itemStatus.toLowerCase() !== status.toLowerCase()) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      const searchableCols = cols.filter((col) => col.searchable !== false);
      if (searchableCols.length === 0) {
        return Object.values(item).some((val) =>
          String(val ?? '').toLowerCase().includes(query),
        );
      }

      return searchableCols.some((col) => {
        const mainVal = String(this.getNestedValue(item, String(col.field)) ?? '').toLowerCase();
        const subVal = col.subField
          ? String(this.getNestedValue(item, String(col.subField)) ?? '').toLowerCase()
          : '';
        return mainVal.includes(query) || subVal.includes(query);
      });
    });

    const activeSortCol = this.sortColumn();
    if (!activeSortCol) {
      return [...filtered];
    }

    const dir = this.sortDirection();
    return [...filtered].sort((a, b) => {
      const rawA = this.getNestedValue(a, activeSortCol);
      const rawB = this.getNestedValue(b, activeSortCol);

      if (rawA == null && rawB == null) return 0;
      if (rawA == null) return dir === 'asc' ? -1 : 1;
      if (rawB == null) return dir === 'asc' ? 1 : -1;

      const valA = typeof rawA === 'string' ? rawA.toLowerCase() : rawA;
      const valB = typeof rawB === 'string' ? rawB.toLowerCase() : rawB;

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  readonly totalItems = computed(() => this.processedData().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  readonly effectivePage = computed(() =>
    Math.min(this.currentPage(), this.totalPages()),
  );

  readonly startIndex = computed(() => (this.effectivePage() - 1) * this.pageSize());

  readonly endIndex = computed(() =>
    Math.min(this.startIndex() + this.pageSize(), this.totalItems()),
  );

  readonly paginatedData = computed<T[]>(() =>
    this.processedData().slice(this.startIndex(), this.endIndex()),
  );

  readonly pageNumbers = computed<(number | '...')[]>(() => {
    const current = this.effectivePage();
    const total = this.totalPages();
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, '...', total];
    }
    if (current >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  readonly selectedCount = computed(() => this.selectedKeys().size);

  readonly allPageSelected = computed(() => {
    const pageItems = this.paginatedData();
    if (pageItems.length === 0) return false;
    const keys = this.selectedKeys();
    return pageItems.every((item) => keys.has(this.getRowKey(item)));
  });

  readonly somePageSelected = computed(() => {
    const pageItems = this.paginatedData();
    if (pageItems.length === 0) return false;
    const keys = this.selectedKeys();
    const count = pageItems.filter((item) => keys.has(this.getRowKey(item))).length;
    return count > 0 && count < pageItems.length;
  });

  readonly hasActiveFilters = computed(
    () => this.searchQuery().trim().length > 0 || this.statusFilter() !== 'Todos',
  );

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('Todos');
    this.currentPage.set(1);
  }

  onPageSizeChange(size: number | string): void {
    const parsed = Number(size);
    if (parsed > 0) {
      this.pageSize.set(parsed);
      this.currentPage.set(1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  handleSort(col: DatatableColumn<T>): void {
    if (col.sortable === false) return;
    const field = String(col.field);
    if (this.sortColumn() === field) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(field);
      this.sortDirection.set('asc');
    }
    this.sortChange.emit({
      column: this.sortColumn(),
      direction: this.sortDirection(),
    });
  }

  isRowSelected(row: T): boolean {
    return this.selectedKeys().has(this.getRowKey(row));
  }

  toggleRowSelection(row: T): void {
    const key = this.getRowKey(row);
    const next = new Set(this.selectedKeys());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.selectedKeys.set(next);
    this.emitSelection();
  }

  toggleSelectAllOnPage(checked: boolean): void {
    const next = new Set(this.selectedKeys());
    for (const item of this.paginatedData()) {
      const key = this.getRowKey(item);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
    }
    this.selectedKeys.set(next);
    this.emitSelection();
  }

  triggerBulkDelete(): void {
    const keys = this.selectedKeys();
    const selectedRows = this.data().filter((item) => keys.has(this.getRowKey(item)));
    if (selectedRows.length > 0) {
      this.bulkDelete.emit(selectedRows);
    }
  }

  clearSelection(): void {
    this.selectedKeys.set(new Set());
    this.emitSelection();
  }

  exportToCSV(): void {
    const cols = this.columns();
    const rows = this.processedData();
    if (cols.length === 0) return;

    const escapeCell = (val: string) => `"${val.replaceAll('"', '""')}"`;
    const headers = cols.map((c) => escapeCell(c.header)).join(';');
    const body = rows.map((row) =>
      cols.map((col) => escapeCell(this.formatCell(row, col))).join(';'),
    );
    const csv = `\uFEFF${[headers, ...body].join('\r\n')}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exportacao-dados.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  formatCell(row: T, col: DatatableColumn<T>): string {
    const raw = this.getNestedValue(row, String(col.field));
    if (raw === null || raw === undefined || raw === '') return '—';

    switch (col.dataType) {
      case 'date':
        return this.datePipe.transform(raw as string | number | Date, 'dd/MM/yyyy') ?? String(raw);
      case 'currency':
        return this.currencyPipe.transform(Number(raw), 'BRL', 'symbol', '1.2-2') ?? String(raw);
      case 'number':
        return Number(raw).toLocaleString('pt-BR');
      case 'boolean':
        return raw ? 'Sim' : 'Não';
      default:
        return String(raw);
    }
  }

  getSubValue(row: T, col: DatatableColumn<T>): string {
    if (!col.subField) return '';
    const val = this.getNestedValue(row, String(col.subField));
    return val != null ? String(val) : '';
  }

  getBadgeTone(value: unknown): 'success' | 'warning' | 'danger' | 'neutral' {
    const norm = String(value ?? '').toLowerCase();
    if (['ativo', 'pago', 'recebido', 'concluido', 'concluído', 'aprovado'].includes(norm)) {
      return 'success';
    }
    if (['pendente', 'aberta', 'em_andamento', 'suspenso'].includes(norm)) {
      return 'warning';
    }
    if (['inativo', 'cancelado', 'vencido', 'bloqueado'].includes(norm)) {
      return 'danger';
    }
    return 'neutral';
  }

  isActionVisible(action: DatatableAction<T>, row: T): boolean {
    return action.visible ? action.visible(row) : true;
  }

  isActionDisabled(action: DatatableAction<T>, row: T): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  getRowKey(row: T): string | number {
    const keyVal = this.getNestedValue(row, String(this.rowKey()));
    if (typeof keyVal === 'string' || typeof keyVal === 'number') {
      return keyVal;
    }
    return JSON.stringify(row);
  }

  private emitSelection(): void {
    const keys = this.selectedKeys();
    const selectedRows = this.data().filter((item) => keys.has(this.getRowKey(item)));
    this.selectionChange.emit(selectedRows);
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }
}
