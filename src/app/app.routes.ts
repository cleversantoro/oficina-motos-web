import { Routes } from '@angular/router';
import { ClienteLista } from './features/clientes/pages/cliente-lista/cliente-lista';
import { ClienteCadastro } from './features/clientes/pages/cliente-cadastro/cliente-cadastro';
import { OsDetalhe } from './features/ordens-servico/pages/os-detalhe/os-detalhe';
import { EstoqueLista } from './features/estoque/pages/estoque-lista/estoque-lista';
import { MecanicoDetalhe } from './features/mecanicos/pages/mecanico-detalhe/mecanico-detalhe';
import { VeiculoDetalhe } from './features/motos/pages/veiculo-detalhe/veiculo-detalhe';
import { FinanceiroDashboard } from './features/financeiro/pages/financeiro-dashboard/financeiro-dashboard';
import { FornecedorDetalhe } from './features/fornecedores/pages/fornecedor-detalhe/fornecedor-detalhe';
import { DashboardPrincipal } from './features/dashboard/pages/dashboard-principal/dashboard-principal';
import { MainLayout } from './layout/main-layout/main-layout';
import { PlaceholderPage } from './shared/ui/placeholder-page/placeholder-page';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardPrincipal,
      },
      { path: 'clientes', component: ClienteLista },
      { path: 'clientes/novo', component: ClienteCadastro },
      {
        path: 'motos',
        component: VeiculoDetalhe,
      },
      {
        path: 'estoque',
        component: EstoqueLista,
      },
      {
        path: 'fornecedores',
        component: FornecedorDetalhe,
      },
      {
        path: 'mecanicos',
        component: MecanicoDetalhe,
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
];
