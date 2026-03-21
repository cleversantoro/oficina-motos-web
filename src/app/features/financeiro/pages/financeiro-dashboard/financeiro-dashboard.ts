import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule],
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

  rows = 5;
  filterPagar = '';       firstPagar = 0;
  filterReceber = '';     firstReceber = 0;
  filterLancamentos = ''; firstLancamentos = 0;

  get filteredPagar(): FinanceiroContaPagar[] {
    const q = this.filterPagar.trim().toLowerCase();
    if (!q) return this.pagar;
    return this.pagar.filter(c =>
      (c.descricao ?? '').toLowerCase().includes(q) ||
      (c.status    ?? '').toLowerCase().includes(q) ||
      String(c.fornecedorId ?? '').includes(q)
    );
  }

  get filteredReceber(): FinanceiroContaReceber[] {
    const q = this.filterReceber.trim().toLowerCase();
    if (!q) return this.receber;
    return this.receber.filter(c =>
      (c.descricao ?? '').toLowerCase().includes(q) ||
      (c.status    ?? '').toLowerCase().includes(q) ||
      String(c.clienteId ?? '').includes(q)
    );
  }

  get filteredLancamentos(): FinanceiroLancamento[] {
    const q = this.filterLancamentos.trim().toLowerCase();
    if (!q) return this.lancamentos;
    return this.lancamentos.filter(c =>
      (c.descricao ?? '').toLowerCase().includes(q) ||
      (c.tipo      ?? '').toLowerCase().includes(q)
    );
  }

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

  prevPagePagar():  void { this.firstPagar = Math.max(0, this.firstPagar - this.rows); }
  nextPagePagar():  void { if (this.firstPagar  + this.rows < this.filteredPagar.length)  this.firstPagar  += this.rows; }

  prevPageReceber():  void { this.firstReceber = Math.max(0, this.firstReceber - this.rows); }
  nextPageReceber():  void { if (this.firstReceber  + this.rows < this.filteredReceber.length)  this.firstReceber  += this.rows; }

  prevPageLancamentos(): void { this.firstLancamentos = Math.max(0, this.firstLancamentos - this.rows); }
  nextPageLancamentos(): void { if (this.firstLancamentos + this.rows < this.filteredLancamentos.length) this.firstLancamentos += this.rows; }
}
