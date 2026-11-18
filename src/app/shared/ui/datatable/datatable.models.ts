import { TemplateRef } from '@angular/core';

export type DatatableSortDirection = 'asc' | 'desc';

export type DatatableDataType = 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'badge';

export type DatatableAlign = 'left' | 'center' | 'right';

export interface DatatableColumn<T = Record<string, unknown>> {
  field: keyof T | string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  dataType?: DatatableDataType;
  align?: DatatableAlign;
  width?: string;
  subField?: keyof T | string;
  cellTemplate?: TemplateRef<{ $implicit: T }>;
}

export interface DatatableAction<T = Record<string, unknown>> {
  id: string;
  icon: string;
  label: string;
  variant?: 'view' | 'edit' | 'delete' | 'default';
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  onClick: (row: T) => void;
}

export interface DatatableStatusOption {
  label: string;
  value: string;
}

export interface DatatableSortState {
  column: string;
  direction: DatatableSortDirection;
}
