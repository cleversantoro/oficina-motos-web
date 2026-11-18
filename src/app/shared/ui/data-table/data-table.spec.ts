import { CurrencyPipe, DatePipe } from '@angular/common';
import { DataTable } from './data-table';

describe('DataTable', () => {
  let component: DataTable<any>;

  beforeEach(() => {
    component = new DataTable(new CurrencyPipe('pt-BR'), new DatePipe('pt-BR'));
  });

  it('hides actions when the current role is not allowed', () => {
    component.currentRole = 'Consulta';

    const action = {
      icon: 'pi pi-trash',
      onClick: () => undefined,
      requiredRoles: ['Administrador', 'Gerente'],
    };

    expect(component.isActionVisible(action, {})).toBe(false);
  });

  it('keeps actions visible for allowed roles', () => {
    component.currentRole = 'Gerente';

    const action = {
      icon: 'pi pi-trash',
      onClick: () => undefined,
      requiredRoles: ['Administrador', 'Gerente'],
    };

    expect(component.isActionVisible(action, {})).toBe(true);
  });

  it('uses the same default table and pagination settings as clientes table', () => {
    expect(component.paginationConfig.rows).toBe(5);
    expect(component.paginationConfig.rowsPerPageOptions).toEqual([10, 25, 50]);
    expect(component.config.size).toBe('small');
    expect(component.config.showGridlines).toBe(false);
    expect(component.config.hoverable).toBe(true);
    expect(component.getTableClass()).toContain('p-datatable-sm');
  });

  it('emits rowClick when a row is clicked', () => {
    const spy = vi.fn();
    component.rowClick.subscribe(spy);
    const row = { id: 42 };
    component.onRowClick({ data: row });
    expect(spy).toHaveBeenCalledWith(row);
  });
});
