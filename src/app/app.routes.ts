import { Routes } from '@angular/router';
import { ClienteLista } from './features/clientes/pages/cliente-lista/cliente-lista';
import { ClienteDetalhe } from './features/clientes/pages/cliente-detalhe/cliente-detalhe';
import { ClienteCadastro } from './features/clientes/pages/cliente-cadastro/cliente-cadastro';
import { ClienteEditar } from './features/clientes/pages/cliente-editar/cliente-editar';
import { EstoqueLista } from './features/estoque/pages/estoque-lista/estoque-lista';
import { MecanicoLista } from './features/mecanicos/pages/mecanico-lista/mecanico-lista';
import { VeiculoDetalhe } from './features/motos/pages/veiculo-detalhe/veiculo-detalhe';
import { VeiculoLista } from './features/motos/pages/veiculo-lista/veiculo-lista';
import { FinanceiroDashboard } from './features/financeiro/pages/financeiro-dashboard/financeiro-dashboard';
import { FornecedorDetalhe } from './features/fornecedores/pages/fornecedor-detalhe/fornecedor-detalhe';
import { FornecedorLista } from './features/fornecedores/pages/fornecedor-lista/fornecedor-lista';
import { DashboardPrincipal } from './features/dashboard/pages/dashboard-principal/dashboard-principal';
import { MainLayout } from './layout/main-layout/main-layout';
import { LoginPage } from './features/auth/login/login';
import { authGuard } from './core/auth/auth.guard';
import { ordensPermissionGuard } from './core/auth/ordens-permission.guard';

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
        component: DashboardPrincipal,
      },
      { path: 'clientes', component: ClienteLista },
      { path: 'clientes/novo', component: ClienteCadastro },
      { path: 'clientes/:id', component: ClienteDetalhe },
      { path: 'clientes/:id/editar', component: ClienteEditar },
      { path: 'motos', component: VeiculoLista },
      { path: 'motos/:id', component: VeiculoDetalhe },
      {
        path: 'estoque',
        component: EstoqueLista,
      },
      { path: 'fornecedores', component: FornecedorLista },
      { path: 'fornecedores/:id', component: FornecedorDetalhe },
      {
        path: 'mecanicos',
        component: MecanicoLista,
      },
      {
        path: 'ordens',
        canActivate: [ordensPermissionGuard],
        data: { ordensAction: 'visualizar' },
        loadComponent: () => import('./features/ordens-servico/pages/os-lista/os-lista').then(m => m.OsListaComponent),
      },
      {
        path: 'ordens/novo',
        canActivate: [ordensPermissionGuard],
        data: { ordensAction: 'criar' },
        loadComponent: () => import('./features/ordens-servico/pages/os-novo/os-novo').then(m => m.OsNovoComponent),
      },
      {
        path: 'ordens/:id',
        canActivate: [ordensPermissionGuard],
        data: { ordensAction: 'visualizar' },
        loadComponent: () => import('./features/ordens-servico/pages/os-detalhe/os-detalhe').then(m => m.OsDetalheComponent),
      },
      {
        path: 'financeiro',
        component: FinanceiroDashboard,
      },
    ],
  },

  // Rota wildcard — redireciona para dashboard (que redireciona ao login se necessário)
  { path: '**', redirectTo: '' },
];

