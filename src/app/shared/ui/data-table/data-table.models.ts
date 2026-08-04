/**
 * Modelos e interfaces para o componente DataTable
 */

import { TemplateRef } from '@angular/core';

/**
 * Tipos de dados suportados nas colunas
 */
export type ColumnDataType = 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'custom';

/**
 * Definição de uma coluna da tabela
 */
export interface TableColumn<T = any> {
  /** Campo do objeto a ser exibido */
  field: keyof T | string;

  /** Cabeçalho da coluna */
  header: string;

  /** Tipo de dado (para formatação automática) */
  dataType?: ColumnDataType;

  /** Largura da coluna (ex: '100px', '20%') */
  width?: string;

  /** Se a coluna é ordenável */
  sortable?: boolean;

  /** Se a coluna é filtrável */
  filterable?: boolean;

  /** Tipo de filtro (text, numeric, date, boolean) */
  filterType?: 'text' | 'numeric' | 'date' | 'boolean';

  /** Template customizado para a célula */
  cellTemplate?: TemplateRef<any>;

  /** Função para formatar o valor exibido */
  formatter?: (value: any, row: T) => string;

  /** Se deve ocultar a coluna (responsividade) */
  hidden?: boolean;

  /** CSS class para a coluna */
  styleClass?: string;

  /** Alinhamento (left, center, right) */
  align?: 'left' | 'center' | 'right';
}

/**
 * Ação disponível na tabela (botões de ação por linha)
 */
export interface TableAction<T = any> {
  /** Label do botão */
  label?: string;

  /** Ícone do botão (PrimeIcons) */
  icon: string;

  /** Tooltip ao passar o mouse */
  tooltip?: string;

  /** Classe CSS do botão (ex: p-button-success, p-button-danger) */
  styleClass?: string;

  /** Callback ao clicar na ação */
  onClick: (row: T) => void;

  /** Condição para exibir o botão (opcional) */
  visible?: (row: T) => boolean;

  /** Condição para desabilitar o botão (opcional) */
  disabled?: (row: T) => boolean;

  /** Papéis permitidos para exibir a ação */
  requiredRoles?: string[];
}

/**
 * Configurações de paginação
 */
export interface TablePaginationConfig {
  /** Número de linhas por página */
  rows?: number;

  /** Opções de linhas por página */
  rowsPerPageOptions?: number[];

  /** Se deve mostrar o paginador */
  showPaginator?: boolean;

  /** Posição do paginador */
  paginatorPosition?: 'top' | 'bottom' | 'both';
}

/**
 * Configurações gerais da tabela
 */
export interface TableConfig {
  /** Se a tabela é responsiva */
  responsive?: boolean;

  /** Se pode selecionar linhas */
  selectable?: boolean;

  /** Modo de seleção (single, multiple) */
  selectionMode?: 'single' | 'multiple';

  /** Se mostraGridLines */
  showGridlines?: boolean;

  /** Se linhas tem efeito hover */
  hoverable?: boolean;

  /** Tamanho da tabela (small, normal, large) */
  size?: 'small' | 'normal' | 'large';

  /** Se mostra loading overlay */
  loading?: boolean;

  /** Mensagem quando não há dados */
  emptyMessage?: string;

  /** Se permite exportar dados */
  exportable?: boolean;

  /** Se mostra filtro global */
  globalFilter?: boolean;

  /** Placeholder do filtro global */
  globalFilterPlaceholder?: string;
}

/**
 * Evento de mudança de página
 */
export interface TablePageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

/**
 * Evento de ordenação
 */
export interface TableSortEvent {
  field: string;
  order: 1 | -1;
}

/**
 * Evento de filtro
 */
export interface TableFilterEvent {
  filters: { [key: string]: any };
}
