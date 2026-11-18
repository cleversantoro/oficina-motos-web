import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ordensPermissionGuard } from './core/auth/ordens-permission.guard';
import { roleGuard } from './core/auth/role.guard';
import { LoginPage } from './features/auth/login/login';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  // Rota pública — login
  { path: 'login', component: LoginPage },

  // Rotas protegidas — requerem autenticação
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-principal/dashboard-principal').then(
            (m) => m.DashboardPrincipal,
          ),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/pages/cliente-lista/cliente-lista').then(
            (m) => m.ClienteLista,
          ),
      },
      {
        path: 'clientes/novo',
        loadComponent: () =>
          import('./features/clientes/pages/cliente-cadastro/cliente-cadastro').then(
            (m) => m.ClienteCadastro,
          ),
      },
      {
        path: 'clientes/:id',
        loadComponent: () =>
          import('./features/clientes/pages/cliente-detalhe/cliente-detalhe').then(
            (m) => m.ClienteDetalhe,
          ),
      },
      {
        path: 'clientes/:id/editar',
        loadComponent: () =>
          import('./features/clientes/pages/cliente-editar/cliente-editar').then(
            (m) => m.ClienteEditar,
          ),
      },
      {
        path: 'motos',
        loadComponent: () =>
          import('./features/motos/pages/veiculo-lista/veiculo-lista').then(
            (m) => m.VeiculoLista,
          ),
      },
      {
        path: 'motos/novo',
        loadComponent: () =>
          import('./features/motos/pages/veiculo-cadastro/veiculo-cadastro').then(
            (m) => m.VeiculoCadastroComponent,
          ),
      },
      {
        path: 'motos/:id',
        loadComponent: () =>
          import('./features/motos/pages/veiculo-detalhe/veiculo-detalhe').then(
            (m) => m.VeiculoDetalhe,
          ),
      },
      {
        path: 'estoque',
        loadComponent: () =>
          import('./features/estoque/pages/estoque-lista/estoque-lista').then(
            (m) => m.EstoqueLista,
          ),
      },
      {
        path: 'estoque/novo',
        loadComponent: () =>
          import('./features/estoque/pages/estoque-peca-cadastro/estoque-peca-cadastro').then(
            (m) => m.EstoquePecaCadastroComponent,
          ),
      },
      {
        path: 'estoque/:id',
        loadComponent: () =>
          import('./features/estoque/pages/estoque-peca-detalhe/estoque-peca-detalhe').then(
            (m) => m.EstoquePecaDetalheComponent,
          ),
      },
      {
        path: 'fornecedores',
        loadComponent: () =>
          import('./features/fornecedores/pages/fornecedor-lista/fornecedor-lista').then(
            (m) => m.FornecedorLista,
          ),
      },
      {
        path: 'fornecedores/novo',
        loadComponent: () =>
          import('./features/fornecedores/pages/fornecedor-cadastro/fornecedor-cadastro').then(
            (m) => m.FornecedorCadastroComponent,
          ),
      },
      {
        path: 'fornecedores/:id',
        loadComponent: () =>
          import('./features/fornecedores/pages/fornecedor-detalhe/fornecedor-detalhe').then(
            (m) => m.FornecedorDetalhe,
          ),
      },
      {
        path: 'mecanicos',
        loadComponent: () =>
          import('./features/mecanicos/pages/mecanico-lista/mecanico-lista').then(
            (m) => m.MecanicoLista,
          ),
      },
      {
        path: 'mecanicos/novo',
        loadComponent: () =>
          import('./features/mecanicos/pages/mecanico-cadastro/mecanico-cadastro').then(
            (m) => m.MecanicoCadastroComponent,
          ),
      },
      {
        path: 'mecanicos/:id',
        loadComponent: () =>
          import('./features/mecanicos/pages/mecanico-detalhe/mecanico-detalhe').then(
            (m) => m.MecanicoDetalheComponent,
          ),
      },
      {
        path: 'ordens',
        canActivate: [ordensPermissionGuard],
        data: { ordensAction: 'visualizar' },
        loadComponent: () =>
          import('./features/ordens-servico/pages/os-lista/os-lista').then(
            (m) => m.OsListaComponent,
          ),
      },
      {
        path: 'ordens/novo',
        canActivate: [ordensPermissionGuard],
        data: { ordensAction: 'criar' },
        loadComponent: () =>
          import('./features/ordens-servico/pages/os-novo/os-novo').then(
            (m) => m.OsCadastroComponent,
          ),
      },
      {
        path: 'ordens/:id',
        canActivate: [ordensPermissionGuard],
        data: { ordensAction: 'visualizar' },
        loadComponent: () =>
          import('./features/ordens-servico/pages/os-detalhe/os-detalhe').then(
            (m) => m.OsDetalheComponent,
          ),
      },
      {
        path: 'financeiro',
        loadComponent: () =>
          import('./features/financeiro/pages/financeiro-dashboard/financeiro-dashboard').then(
            (m) => m.FinanceiroDashboard,
          ),
      },
      {
        path: 'financeiro/contas-pagar',
        loadComponent: () =>
          import('./features/financeiro/pages/contas-pagar-lista/contas-pagar-lista').then(
            (m) => m.ContasPagarListaComponent,
          ),
      },
      {
        path: 'financeiro/contas-pagar/novo',
        loadComponent: () =>
          import('./features/financeiro/pages/contas-pagar-form/contas-pagar-form').then(
            (m) => m.ContasPagarFormComponent,
          ),
      },
      {
        path: 'financeiro/contas-pagar/:id/editar',
        loadComponent: () =>
          import('./features/financeiro/pages/contas-pagar-form/contas-pagar-form').then(
            (m) => m.ContasPagarFormComponent,
          ),
      },
      {
        path: 'financeiro/contas-receber',
        loadComponent: () =>
          import('./features/financeiro/pages/contas-receber-lista/contas-receber-lista').then(
            (m) => m.ContasReceberListaComponent,
          ),
      },
      {
        path: 'financeiro/contas-receber/novo',
        loadComponent: () =>
          import('./features/financeiro/pages/contas-receber-form/contas-receber-form').then(
            (m) => m.ContasReceberFormComponent,
          ),
      },
      {
        path: 'financeiro/contas-receber/:id/editar',
        loadComponent: () =>
          import('./features/financeiro/pages/contas-receber-form/contas-receber-form').then(
            (m) => m.ContasReceberFormComponent,
          ),
      },
      {
        path: 'seguranca/usuarios',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Administrador'] },
        loadComponent: () =>
          import('./features/seguranca/pages/usuario-lista/usuario-lista').then(
            (m) => m.UsuarioListaComponent,
          ),
      },
      {
        path: 'seguranca/usuarios/novo',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Administrador'] },
        loadComponent: () =>
          import('./features/seguranca/pages/usuario-form/usuario-form').then(
            (m) => m.UsuarioFormComponent,
          ),
      },
      {
        path: 'seguranca/usuarios/:id/editar',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Administrador'] },
        loadComponent: () =>
          import('./features/seguranca/pages/usuario-form/usuario-form').then(
            (m) => m.UsuarioFormComponent,
          ),
      },
      {
        path: 'seguranca/perfis',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Administrador'] },
        loadComponent: () =>
          import('./features/seguranca/pages/perfil-lista/perfil-lista').then(
            (m) => m.PerfilListaComponent,
          ),
      },
    ],
  },

  // Rota wildcard — redireciona para dashboard (que redireciona ao login se necessário)
  { path: '**', redirectTo: '' },
];
