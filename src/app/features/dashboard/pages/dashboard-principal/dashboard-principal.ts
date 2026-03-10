import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type Kpi = { title: string; value: string; intent?: 'success' | 'danger' | 'warning'; footer?: string; link?: string };
type Forecast = { tipo: 'entrada' | 'saida' | 'saldo'; rotulo: string; valor: string; detalhe: string };
type OsEtapa = { label: string; valor: number; cor: string };
type Gasto = { nome: string; valor: string };

@Component({
  selector: 'app-dashboard-principal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-principal.html',
  styleUrl: './dashboard-principal.scss',
})
export class DashboardPrincipal {
  readonly kpis: Kpi[] = [
    { title: 'Ticket Medio (OS concluidas - mes)', value: 'R$ 1.250,00', intent: 'success', footer: '25 OS fechadas' },
    { title: 'Contas a pagar vencidas', value: 'R$ 4.890,00', intent: 'danger', footer: '4 boletos em atraso' },
    { title: 'Pedidos de pecas pendentes', value: '7', intent: 'warning', footer: '2 pedidos em atraso' },
  ];

  readonly operacao = {
    veiculosServico: 12,
    revisaoAlerta: 3,
    osEtapas: [
      { label: 'Orcamento', valor: 8, cor: '#06b6d4' },
      { label: 'Aprovado', valor: 6, cor: '#22c55e' },
      { label: 'Aguardando peca', valor: 4, cor: '#f97316' },
      { label: 'Em execucao', valor: 9, cor: '#1d4ed8' },
      { label: 'Aguardando retirada', valor: 2, cor: '#64748b' },
    ] as OsEtapa[],
  };

  readonly financeiro: Forecast[] = [
    { tipo: 'entrada', rotulo: 'A receber (OS)', valor: '+ R$ 9.500,00', detalhe: '5 pagamentos de clientes' },
    { tipo: 'saida', rotulo: 'A pagar (boletos)', valor: '- R$ 5.100,00', detalhe: 'Aluguel e 2 fornecedores' },
    { tipo: 'saldo', rotulo: 'Saldo liquido', valor: 'R$ 4.400,00', detalhe: 'Previsao de caixa positiva' },
  ];

  readonly fornecedores = {
    score: '★★★★☆ 4.2',
    gastos: [
      { nome: '1. Lubrificantes Souza', valor: 'R$ 4.500,00' },
      { nome: '2. Auto Distribuidora Sul', valor: 'R$ 3.200,00' },
      { nome: '3. Pneus Norte', valor: 'R$ 1.800,00' },
    ] as Gasto[],
  };
}
