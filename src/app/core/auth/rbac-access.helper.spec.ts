import {
  canPerformBusinessAction,
  canPerformPermission,
  getAllowedRoles,
  normalizeRole,
} from './rbac-access.helper';

describe('rbac-access.helper', () => {
  it('normalizes roles with accents and whitespace', () => {
    expect(normalizeRole(' Mecânico ')).toBe('mecanico');
    expect(normalizeRole('ADMINISTRADOR')).toBe('administrador');
  });

  it('respects the permission matrix for destructive actions', () => {
    expect(canPerformBusinessAction('Recepcionista', 'clientes', 'edit')).toBe(true);
    expect(canPerformBusinessAction('Recepcionista', 'clientes', 'delete')).toBe(false);
    expect(canPerformBusinessAction('Consulta', 'ordens', 'delete')).toBe(false);
    expect(canPerformBusinessAction('Financeiro', 'financeiro', 'delete')).toBe(true);
  });

  it('exposes the allowed roles for a module action', () => {
    expect(getAllowedRoles('clientes', 'delete')).toEqual(['Administrador', 'Gerente']);
  });

  it('validates canonical permissions by module and action', () => {
    expect(canPerformPermission(['ordens:visualizar'], 'ordens', 'visualizar')).toBe(true);
    expect(canPerformPermission(['ordens:criar'], 'ordens', 'visualizar')).toBe(false);
    expect(canPerformPermission([], 'ordens', 'criar')).toBe(false);
  });
});
