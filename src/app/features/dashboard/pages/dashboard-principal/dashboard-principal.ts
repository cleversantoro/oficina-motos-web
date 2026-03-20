import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { OrdensService } from '../../../../core/services/ordens.service';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { FinanceiroContaPagar, FinanceiroContaReceber } from '../../../../core/models';

export type OsEtapa = { label: string; valor: number; cor: string };
export type Gasto = { nome: string; valor: string };
export type Forecast = { tipo: 'entrada' | 'saida' | 'saldo'; rotulo: string; valor: string; detalhe: string };
export type Kpi = { title: string; value: string; intent?: 'success' | 'danger' | 'warning'; footer?: string };

const STATUS_CORES: Record<string, string> = {
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
export class DashboardPrincipal implements OnInit {
  loading = true;

  kpis: Kpi[] = [];
  osEtapas: OsEtapa[] = [];
  osEmAberto = 0;
  pecasAbaixoMinimo = 0;
  financeiro: Forecast[] = [];
  fornecedorScore = '-';
  fornecedorGastos: Gasto[] = [];

  constructor(
    private ordensService: OrdensService,
    private financeiroService: FinanceiroService,
    private estoqueService: EstoqueService,
    private fornecedoresService: FornecedoresService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      ordens: this.ordensService.list(),
      contasPagar: this.financeiroService.contasPagar(),
      contasReceber: this.financeiroService.contasReceber(),
      pecas: this.estoqueService.pecas(),
      fornecedores: this.fornecedoresService.list(),
      avaliacoes: this.fornecedoresService.avaliacoes(),
    }).subscribe({
      next: (data: any) => this.processar(data),
      error: () => { this.loading = false; },
    });
  }

  private processar(data: {
    ordens: any[];
    contasPagar: FinanceiroContaPagar[];
    contasReceber: FinanceiroContaReceber[];
    pecas: any[];
    fornecedores: any[];
    avaliacoes: any[];
  }) {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // ── OS ─────────────────────────────────────────────────────────────────
    const ordens: any[] = data.ordens ?? [];

    const osConcluidas = ordens.filter(o => {
      const status = (o.status ?? '').toLowerCase();
      if (!status.includes('conclu') && !status.includes('fechad')) return false;
      const d = new Date(o.dataConclusao ?? o.dataAbertura);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });

    const ticketMedio = osConcluidas.length
      ? osConcluidas.reduce((acc: number, o: any) => {
          const total = (o.itens ?? []).reduce((s: number, i: any) => s + (i.total ?? 0), 0);
          return acc + total;
        }, 0) / osConcluidas.length
      : 0;

    // OS agrupadas por status (exceto concluídas/canceladas)
    const etapaMap = new Map<string, number>();
    const statusAberto = ordens.filter(o => {
      const st = (o.status ?? '').toLowerCase();
      return !st.includes('conclu') && !st.includes('cancelad') && !st.includes('fechad');
    });
    for (const o of statusAberto) {
      const st: string = o.status ?? 'Sem status';
      etapaMap.set(st, (etapaMap.get(st) ?? 0) + 1);
    }
    this.osEmAberto = statusAberto.length;
    this.osEtapas = Array.from(etapaMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, valor]) => ({ label, valor, cor: STATUS_CORES[label] ?? '#64748b' }));

    // ── Estoque ────────────────────────────────────────────────────────────
    const pecas: any[] = data.pecas ?? [];
    this.pecasAbaixoMinimo = pecas.filter(p => (p.quantidade ?? 0) <= (p.estoqueMinimo ?? 0)).length;

    // ── Financeiro ─────────────────────────────────────────────────────────
    const pagar: FinanceiroContaPagar[] = data.contasPagar ?? [];
    const receber: FinanceiroContaReceber[] = data.contasReceber ?? [];

    const pagarVencidas = pagar.filter(c => {
      const st = (c.status ?? '').toLowerCase();
      if (st.includes('pag') || st.includes('cancel')) return false;
      return new Date(c.vencimento) < hoje;
    });
    const totalPagarVencido = pagarVencidas.reduce((s, c) => s + (c.valor ?? 0), 0);

    const pagarPendente = pagar.filter(c => {
      const st = (c.status ?? '').toLowerCase();
      return !st.includes('pag') && !st.includes('cancel');
    });
    const totalAPagar = pagarPendente.reduce((s, c) => s + (c.valor ?? 0), 0);

    const receberPendente = receber.filter(c => {
      const st = (c.status ?? '').toLowerCase();
      return !st.includes('receb') && !st.includes('cancel') && !st.includes('pag');
    });
    const totalAReceber = receberPendente.reduce((s, c) => s + (c.valor ?? 0), 0);
    const saldo = totalAReceber - totalAPagar;

    this.financeiro = [
      {
        tipo: 'entrada',
        rotulo: 'A receber',
        valor: '+ ' + this.fmt(totalAReceber),
        detalhe: `${receberPendente.length} conta(s) pendente(s)`,
      },
      {
        tipo: 'saida',
        rotulo: 'A pagar',
        valor: '- ' + this.fmt(totalAPagar),
        detalhe: `${pagarPendente.length} conta(s) pendente(s)`,
      },
      {
        tipo: 'saldo',
        rotulo: 'Saldo previsto',
        valor: this.fmt(saldo),
        detalhe: saldo >= 0 ? 'Caixa positivo' : 'Atenção: caixa negativo',
      },
    ];

    // ── Fornecedores ───────────────────────────────────────────────────────
    const avaliacoes: any[] = data.avaliacoes ?? [];
    if (avaliacoes.length) {
      const media = avaliacoes.reduce((s: number, a: any) => s + (a.nota ?? 0), 0) / avaliacoes.length;
      const estrelas = Math.round(media);
      this.fornecedorScore = '★'.repeat(estrelas) + '☆'.repeat(5 - estrelas) + ` ${media.toFixed(1)}`;
    } else {
      this.fornecedorScore = 'Sem avaliações';
    }

    // Maiores gastos por fornecedor (agrupando contasPagar)
    const gastoForn = new Map<string, number>();
    for (const cp of pagar) {
      if (!cp.fornecedorId) continue;
      const forn = data.fornecedores.find((f: any) => f.id === cp.fornecedorId);
      const nome = forn?.nomeFantasia ?? forn?.razaoSocial ?? forn?.nome ?? `Fornecedor #${cp.fornecedorId}`;
      gastoForn.set(nome, (gastoForn.get(nome) ?? 0) + (cp.valor ?? 0));
    }
    this.fornecedorGastos = Array.from(gastoForn.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nome, valor], i) => ({ nome: `${i + 1}. ${nome}`, valor: this.fmt(valor) }));

    // ── KPIs ───────────────────────────────────────────────────────────────
    this.kpis = [
      {
        title: 'Ticket Médio (OS concluídas - mês)',
        value: ticketMedio > 0 ? this.fmt(ticketMedio) : '-',
        intent: 'success',
        footer: `${osConcluidas.length} OS fechada(s) no mês`,
      },
      {
        title: 'Contas a pagar vencidas',
        value: pagarVencidas.length > 0 ? this.fmt(totalPagarVencido) : 'Sem atrasos',
        intent: pagarVencidas.length > 0 ? 'danger' : 'success',
        footer: `${pagarVencidas.length} boleto(s) em atraso`,
      },
      {
        title: 'Peças abaixo do estoque mínimo',
        value: String(this.pecasAbaixoMinimo),
        intent: this.pecasAbaixoMinimo > 0 ? 'warning' : 'success',
        footer: `${pecas.length} peça(s) no estoque`,
      },
    ];

    this.loading = false;
  }

  private fmt(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get maxOsEtapa(): number {
    return Math.max(1, ...this.osEtapas.map(e => e.valor));
  }
}
