import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';
import {
  DashboardFaturamentoMensal,
  DashboardKpisResponse,
  DashboardPecaCritica,
} from '../../../../core/models/dashboard';

export type OsEtapa = { status: string; label: string; valor: number; cor: string; percentual: number };
export type FaturamentoMesItem = DashboardFaturamentoMensal & {
  valorFormatado: string;
  percentual: number;
};
export type Kpi = {
  title: string;
  value: string;
  intent?: 'success' | 'danger' | 'warning';
  footer?: string;
};

const STATUS_CORES: Record<string, string> = {
  Aberta: '#06b6d4',
  EmAndamento: '#3b82f6',
  AguardandoPeca: '#f97316',
  Concluida: '#22c55e',
  Cancelada: '#ef4444',
  'Orçamento': '#06b6d4',
  'Aprovado': '#22c55e',
  'Aguardando Peça': '#f97316',
  'Em Execução': '#1d4ed8',
  'Aguardando Retirada': '#64748b',
  'Concluído': '#a855f7',
  'Cancelado': '#ef4444',
};

@Component({
  selector: 'app-dashboard-principal',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard-principal.html',
  styleUrl: './dashboard-principal.scss',
})
export class DashboardPrincipalComponent implements OnInit {
  readonly skeletonPlaceholders = [1, 2, 3, 4];

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly kpisData = signal<DashboardKpisResponse | null>(null);

  readonly kpis = computed<Kpi[]>(() => {
    const data = this.kpisData();
    if (!data) {
      return [];
    }

    return [
      {
        title: 'OS Abertas / Do Dia',
        value: `${data.osAbertas} abertas`,
        intent: data.osAbertas > 0 ? 'warning' : 'success',
        footer: `${data.osDoDia} OS aberta(s) hoje`,
      },
      {
        title: 'Faturamento Mensal',
        value: this.fmt(data.faturamentoMensal ?? 0),
        intent: 'success',
        footer: `Competência ${data.periodo} (${data.osConcluidasMes ?? 0} OS concluídas)`,
      },
      {
        title: 'Ticket Médio (Mês)',
        value: (data.ticketMedio ?? 0) > 0 ? this.fmt(data.ticketMedio) : '-',
        intent: 'success',
        footer: `${data.osConcluidasMes ?? 0} OS concluída(s) no período`,
      },
      {
        title: 'Peças em Alerta de Estoque',
        value: String(data.pecasAbaixoMinimo ?? 0),
        intent: (data.pecasAbaixoMinimo ?? 0) > 0 ? 'danger' : 'success',
        footer:
          (data.pecasAbaixoMinimo ?? 0) > 0
            ? `${data.pecasAbaixoMinimo} peça(s) abaixo do mínimo`
            : 'Estoque acima do mínimo',
      },
    ];
  });

  readonly osEtapas = computed<OsEtapa[]>(() => {
    const lista = this.kpisData()?.osPorStatus ?? [];
    const max = Math.max(1, ...lista.map(i => i.quantidade));

    return lista.map(item => ({
      status: item.status,
      label: item.label || item.status,
      valor: item.quantidade,
      cor: STATUS_CORES[item.status] ?? STATUS_CORES[item.label] ?? '#64748b',
      percentual: Math.round((item.quantidade / max) * 80) + 12,
    }));
  });

  readonly faturamentoSeisMeses = computed<FaturamentoMesItem[]>(() => {
    const serie = this.kpisData()?.faturamentoUltimosSeisMeses ?? [];
    const max = Math.max(1, ...serie.map(m => m.valor));

    return serie.map(item => ({
      ...item,
      valorFormatado: this.fmt(item.valor ?? 0),
      percentual: item.valor > 0 ? Math.round((item.valor / max) * 80) + 12 : 8,
    }));
  });

  readonly pecasCriticas = computed<DashboardPecaCritica[]>(() => {
    return this.kpisData()?.pecasCriticas ?? [];
  });

  readonly osEmAberto = computed<number>(() => this.kpisData()?.osAbertas ?? 0);
  readonly osDoDia = computed<number>(() => this.kpisData()?.osDoDia ?? 0);
  readonly pecasAbaixoMinimo = computed<number>(() => this.kpisData()?.pecasAbaixoMinimo ?? 0);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.carregarKpis();
  }

  carregarKpis(periodo?: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getKpis(periodo).subscribe({
      next: response => {
        this.kpisData.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os indicadores do dashboard.');
        this.loading.set(false);
      },
    });
  }

  fmt(value: number): string {
    return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

export { DashboardPrincipalComponent as DashboardPrincipal };
