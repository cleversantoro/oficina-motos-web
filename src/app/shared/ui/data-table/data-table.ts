import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Table } from 'primeng/table';
import {
  TableColumn,
  TableAction,
  TableConfig,
  TablePaginationConfig,
  TablePageEvent,
  TableSortEvent,
} from './data-table.models';

/**
 * Componente de tabela reutilizável com PrimeNG
 *
 * Features:
 * - Paginação
 * - Ordenação
 * - Filtros por coluna
 * - Filtro global
 * - Ações por linha
 * - Seleção de linhas
 * - Loading state
 * - Exportação
 * - Responsivo
 *
 * @example
 * <app-data-table
 *   [data]="clientes"
 *   [columns]="columns"
 *   [actions]="actions"
 *   [loading]="loading"
 *   (rowSelect)="onRowSelect($event)"
 * />
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
  ],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T = any> {
  @ViewChild('dt') table!: Table;

  /** Dados da tabela */
  @Input() data: T[] = [];

  /** Definição das colunas */
  @Input() columns: TableColumn<T>[] = [];

  /** Ações disponíveis por linha */
  @Input() actions: TableAction<T>[] = [];

  /** Estado de carregamento */
  @Input() loading = false;

  /** Configurações da tabela */
  @Input() config: TableConfig = {
    responsive: true,
    selectable: false,
    selectionMode: 'single',
    showGridlines: true,
    hoverable: true,
    size: 'normal',
    emptyMessage: 'Nenhum registro encontrado',
    globalFilter: true,
    globalFilterPlaceholder: 'Buscar...',
  };

  /** Configurações de paginação */
  @Input() paginationConfig: TablePaginationConfig = {
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    showPaginator: true,
    paginatorPosition: 'bottom',
  };

  /** Template customizado para header */
  @Input() headerTemplate?: TemplateRef<any>;

  /** Template customizado para footer */
  @Input() footerTemplate?: TemplateRef<any>;

  // Outputs (eventos)
  @Output() rowSelect = new EventEmitter<T>();
  @Output() rowUnselect = new EventEmitter<T>();
  @Output() rowsSelect = new EventEmitter<T[]>();
  @Output() pageChange = new EventEmitter<TablePageEvent>();
  @Output() sortChange = new EventEmitter<TableSortEvent>();

  /** Linhas selecionadas */
  selectedRows: T | T[] | null = null;

  /** Valor do filtro global */
  globalFilterValue = '';

  constructor(
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  /**
   * Aplica filtro global
   */
  applyGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.table.filterGlobal(value, 'contains');
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters(): void {
    this.table.clear();
    this.globalFilterValue = '';
  }

  /**
   * Exporta dados para CSV
   */
  exportCSV(): void {
    this.table.exportCSV();
  }

  /**
   * Obtém valor formatado da célula
   */
  getCellValue(row: T, column: TableColumn<T>): string {
    const value = this.getNestedValue(row, column.field as string);

    // Se tem formatter customizado, usa ele
    if (column.formatter) {
      return column.formatter(value, row);
    }

    // Formatação automática baseada no tipo
    switch (column.dataType) {
      case 'date':
        return this.datePipe.transform(value, 'dd/MM/yyyy') || '';
      case 'currency':
        return this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2') || '';
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'number':
        return value?.toLocaleString('pt-BR') || '';
      default:
        return value?.toString() || '';
    }
  }

  /**
   * Obtém valor aninhado do objeto (suporta 'cliente.nome')
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  /**
   * Verifica se ação deve ser exibida
   */
  isActionVisible(action: TableAction<T>, row: T): boolean {
    return action.visible ? action.visible(row) : true;
  }

  /**
   * Verifica se ação deve ser desabilitada
   */
  isActionDisabled(action: TableAction<T>, row: T): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  /**
   * Handler de seleção de linha
   */
  onRowSelect(event: any): void {
    this.rowSelect.emit(event.data);
  }

  /**
   * Handler de desseleção de linha
   */
  onRowUnselect(event: any): void {
    this.rowUnselect.emit(event.data);
  }

  /**
   * Handler de mudança de página
   */
  onPageChange(event: any): void {
    this.pageChange.emit(event);
  }

  /**
   * Handler de ordenação
   */
  onSort(event: any): void {
    this.sortChange.emit({
      field: event.field,
      order: event.order,
    });
  }

  /**
   * Obtém classe CSS para a tabela
   */
  getTableClass(): string {
    const classes = ['data-table'];

    if (this.config.size === 'small') classes.push('p-datatable-sm');
    if (this.config.size === 'large') classes.push('p-datatable-lg');
    if (this.config.showGridlines) classes.push('p-datatable-gridlines');
    if (this.config.hoverable) classes.push('p-datatable-hoverable-rows');

    return classes.join(' ');
  }

  /**
   * Obtém campos globais de filtro
   */
  get globalFilterFields(): string[] {
    return this.columns.map(col => String(col.field));
  }

  /**
   * Obtém campo como string para binding
   */
  getFieldAsString(col: TableColumn<T>): string {
    return String(col.field);
  }

  /**
   * Obtém coluna ordenável
   */
  getSortableColumn(col: TableColumn<T>): string | undefined {
    return col.sortable !== false ? String(col.field) : undefined;
  }

  /**
   * Handler de filtro por coluna
   */
  onColumnFilter(event: Event, col: TableColumn<T>, matchMode: string): void {
    const value = (event.target as HTMLInputElement).value;
    this.table.filter(value, String(col.field), matchMode);
  }

  /**
   * Calcula total de colunas para colspan
   */
  getTotalColumns(): number {
    let total = this.columns.filter(col => !col.hidden).length;
    if (this.actions.length > 0) total++;
    if (this.config.selectable && this.config.selectionMode === 'multiple') total++;
    return total;
  }
}
