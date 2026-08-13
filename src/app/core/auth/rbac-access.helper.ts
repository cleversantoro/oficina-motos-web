export type BusinessModule =
  | 'clientes'
  | 'veiculos'
  | 'fornecedores'
  | 'mecanicos'
  | 'estoque'
  | 'ordens'
  | 'financeiro';

export type BusinessAction = 'create' | 'edit' | 'delete' | 'approve';

export type PermissionAction = 'visualizar' | 'criar';

const PERMISSION_ROLE_MATRIX: Record<BusinessModule, Record<PermissionAction, string[]>> = {
  clientes: {
    visualizar: ['Administrador', 'Gerente', 'Recepcionista', 'Financeiro', 'Mecânico', 'Consulta'],
    criar: ['Administrador', 'Gerente', 'Recepcionista'],
  },
  veiculos: {
    visualizar: ['Administrador', 'Gerente', 'Recepcionista', 'Financeiro', 'Mecânico', 'Consulta'],
    criar: ['Administrador', 'Gerente', 'Recepcionista'],
  },
  fornecedores: {
    visualizar: ['Administrador', 'Gerente', 'Recepcionista', 'Financeiro', 'Mecânico', 'Consulta'],
    criar: ['Administrador', 'Gerente'],
  },
  mecanicos: {
    visualizar: ['Administrador', 'Gerente', 'Recepcionista', 'Financeiro', 'Mecânico', 'Consulta'],
    criar: ['Administrador', 'Gerente'],
  },
  estoque: {
    visualizar: ['Administrador', 'Gerente', 'Recepcionista', 'Financeiro', 'Mecânico', 'Consulta'],
    criar: ['Administrador', 'Gerente', 'Mecânico'],
  },
  ordens: {
    visualizar: ['Administrador', 'Gerente', 'Recepcionista', 'Financeiro', 'Mecânico', 'Consulta'],
    criar: ['Administrador', 'Gerente', 'Recepcionista', 'Mecânico'],
  },
  financeiro: {
    visualizar: ['Administrador', 'Gerente', 'Financeiro', 'Consulta'],
    criar: ['Administrador', 'Gerente', 'Financeiro'],
  },
};

export type RoleName = string | null | undefined;

const ROLE_MATRIX: Record<BusinessModule, Record<BusinessAction, string[]>> = {
  clientes: {
    create: ['Administrador', 'Gerente', 'Recepcionista'],
    edit: ['Administrador', 'Gerente', 'Recepcionista'],
    delete: ['Administrador', 'Gerente'],
    approve: ['Administrador', 'Gerente'],
  },
  veiculos: {
    create: ['Administrador', 'Gerente', 'Recepcionista'],
    edit: ['Administrador', 'Gerente', 'Recepcionista'],
    delete: ['Administrador', 'Gerente'],
    approve: ['Administrador', 'Gerente'],
  },
  fornecedores: {
    create: ['Administrador', 'Gerente'],
    edit: ['Administrador', 'Gerente'],
    delete: ['Administrador', 'Gerente'],
    approve: ['Administrador', 'Gerente'],
  },
  mecanicos: {
    create: ['Administrador', 'Gerente'],
    edit: ['Administrador', 'Gerente'],
    delete: ['Administrador', 'Gerente'],
    approve: ['Administrador', 'Gerente'],
  },
  estoque: {
    create: ['Administrador', 'Gerente', 'Mecânico'],
    edit: ['Administrador', 'Gerente', 'Mecânico'],
    delete: ['Administrador', 'Gerente'],
    approve: ['Administrador', 'Gerente', 'Mecânico'],
  },
  ordens: {
    create: ['Administrador', 'Gerente', 'Recepcionista', 'Mecânico'],
    edit: ['Administrador', 'Gerente', 'Recepcionista', 'Mecânico'],
    delete: ['Administrador', 'Gerente'],
    approve: ['Administrador', 'Gerente', 'Mecânico'],
  },
  financeiro: {
    create: ['Administrador', 'Gerente', 'Financeiro'],
    edit: ['Administrador', 'Gerente', 'Financeiro'],
    delete: ['Administrador', 'Gerente', 'Financeiro'],
    approve: ['Administrador', 'Gerente', 'Financeiro'],
  },
};

export function normalizeRole(role: RoleName): string {
  return (role ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

export function hasAnyRole(role: RoleName, allowedRoles: string[]): boolean {
  const normalizedRole = normalizeRole(role);
  return allowedRoles.some(allowedRole => normalizeRole(allowedRole) === normalizedRole);
}

export function canPerformBusinessAction(
  role: RoleName,
  module: BusinessModule,
  action: BusinessAction,
): boolean {
  return hasAnyRole(role, ROLE_MATRIX[module][action]);
}

export function getAllowedRoles(module: BusinessModule, action: BusinessAction): string[] {
  return [...ROLE_MATRIX[module][action]];
}

export function canPerformPermission(
  permissions: string[] | null | undefined,
  module: BusinessModule,
  action: PermissionAction,
  role?: RoleName,
): boolean {
  const expected = `${module}:${action}`.toLowerCase();
  if (permissions?.length) {
    return permissions.some(permission => permission.trim().toLowerCase() === expected);
  }

  return hasAnyRole(role, PERMISSION_ROLE_MATRIX[module][action]);
}
