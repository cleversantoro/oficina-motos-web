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
});
