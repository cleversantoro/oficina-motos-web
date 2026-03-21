import { Routes } from '@angular/router';
import { ClienteLista } from './features/clientes/pages/cliente-lista/cliente-lista';
import { ClienteCadastro } from './features/clientes/pages/cliente-cadastro/cliente-cadastro';
import { OsDetalhe } from './features/ordens-servico/pages/os-detalhe/os-detalhe';
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
        component: OsDetalhe,
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

