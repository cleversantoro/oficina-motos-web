import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import {
  FinanceiroContaPagar, FinanceiroContaReceber,
  FinanceiroLancamento, FinanceiroMetodoPagamento
} from '../../../../core/models';

type TabId = 'pagar' | 'receber' | 'lancamentos' | 'metodos';

type Kpi = { label: string; valor: number; tipo?: 'entrada' | 'saida' | 'alerta' };

@Component({
  selector: 'app-financeiro-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './financeiro-dashboard.html',
  styleUrl: './financeiro-dashboard.scss',
  providers: [FinanceiroService]
})
export class FinanceiroDashboard implements OnInit {
  activeTab: TabId = 'pagar';
  loading = false;

  pagar: FinanceiroContaPagar[] = [];
  receber: FinanceiroContaReceber[] = [];
  lancamentos: FinanceiroLancamento[] = [];
  metodos: FinanceiroMetodoPagamento[] = [];

  constructor(private financeiroService: FinanceiroService) {}

  ngOnInit(): void {
    this.loading = true;
    this.financeiroService.contasPagar().subscribe({
      next: (resp: any) => { this.pagar = resp; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.financeiroService.contasReceber().subscribe({
      next: (resp: any) => { this.receber = resp; }
    });
    this.financeiroService.lancamentos().subscribe({
      next: (resp: any) => { this.lancamentos = resp; }
    });
    this.financeiroService.metodos().subscribe({
      next: (resp: any) => { this.metodos = resp; }
    });
  }

  get kpis(): Kpi[] {
    const totalReceber = this.receber.filter(c => c.status !== 'pago').reduce((s, c) => s + c.valor, 0);
    const totalPagar = this.pagar.filter(c => c.status !== 'pago').reduce((s, c) => s + c.valor, 0);
    const vencidas = this.pagar.filter(c => c.status === 'vencido').reduce((s, c) => s + c.valor, 0);
    return [
      { label: 'A receber (em aberto)', valor: totalReceber, tipo: 'entrada' },
      { label: 'A pagar (em aberto)', valor: totalPagar, tipo: 'saida' },
      { label: 'Contas vencidas', valor: vencidas, tipo: 'alerta' },
    ];
  }

  setTab(tab: TabId) {
    this.activeTab = tab;
  }
}
