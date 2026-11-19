import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  FinanceiroContaPagar,
  FinanceiroContaReceber,
  FinanceiroLancamento,
  FinanceiroMetodoPagamento,
} from '../../../../core/models';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { DatatableColumn, DatatableComponent } from '../../../../shared/ui/datatable';

type TabId = 'pagar' | 'receber' | 'lancamentos' | 'metodos';

type Kpi = { label: string; valor: number; tipo?: 'entrada' | 'saida' | 'alerta' };

@Component({
  selector: 'app-financeiro-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink, DatatableComponent],
  templateUrl: './financeiro-dashboard.html',
  styleUrl: './financeiro-dashboard.scss',
})
export class FinanceiroDashboard implements OnInit {
  activeTab: TabId = 'pagar';
  loading = false;

  pagar: FinanceiroContaPagar[] = [];
  receber: FinanceiroContaReceber[] = [];
  lancamentos: FinanceiroLancamento[] = [];
  metodos: FinanceiroMetodoPagamento[] = [];

  readonly columnsPagar: readonly DatatableColumn<any>[] = [
    { field: 'vencimento', header: 'Vencimento', dataType: 'date' },
    { field: 'fornecedorLabel', header: 'Fornecedor' },
    { field: 'descricao', header: 'Descrição' },
    { field: 'status', header: 'Status', dataType: 'badge' },
    { field: 'valor', header: 'Valor', dataType: 'currency', align: 'right' },
  ];

  readonly columnsReceber: readonly DatatableColumn<any>[] = [
    { field: 'vencimento', header: 'Vencimento', dataType: 'date' },
    { field: 'clienteLabel', header: 'Cliente' },
    { field: 'descricao', header: 'Descrição' },
    { field: 'status', header: 'Status', dataType: 'badge' },
    { field: 'valor', header: 'Valor', dataType: 'currency', align: 'right' },
  ];

  readonly columnsLancamentos: readonly DatatableColumn<any>[] = [
    { field: 'dataLancamento', header: 'Data', dataType: 'date' },
    { field: 'tipo', header: 'Tipo' },
    { field: 'descricao', header: 'Descrição' },
    { field: 'valor', header: 'Valor', dataType: 'currency', align: 'right' },
  ];

  get pagarRows(): any[] {
    return this.pagar.map((c) => ({
      ...c,
      fornecedorLabel: c.fornecedorId ? `Fornecedor #${c.fornecedorId}` : '-',
    }));
  }

  get receberRows(): any[] {
    return this.receber.map((c) => ({
      ...c,
      clienteLabel: c.clienteId ? `Cliente #${c.clienteId}` : '-',
    }));
  }

  get lancamentosRows(): any[] {
    return this.lancamentos.map((c) => ({ ...c }));
  }

  constructor(private financeiroService: FinanceiroService) {}

  ngOnInit(): void {
    this.loading = true;
    this.financeiroService.contasPagar().subscribe({
      next: (resp: any) => {
        this.pagar = Array.isArray(resp) ? resp : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.financeiroService.contasReceber().subscribe({
      next: (resp: any) => {
        this.receber = Array.isArray(resp) ? resp : [];
      },
    });
    this.financeiroService.lancamentos().subscribe({
      next: (resp: any) => {
        this.lancamentos = Array.isArray(resp) ? resp : [];
      },
    });
    this.financeiroService.metodos().subscribe({
      next: (resp: any) => {
        this.metodos = Array.isArray(resp) ? resp : [];
      },
    });
  }

  get kpis(): Kpi[] {
    const totalReceber = this.receber
      .filter((c) => c.status !== 'pago')
      .reduce((s, c) => s + c.valor, 0);
    const totalPagar = this.pagar
      .filter((c) => c.status !== 'pago')
      .reduce((s, c) => s + c.valor, 0);
    const vencidas = this.pagar
      .filter((c) => c.status === 'vencido')
      .reduce((s, c) => s + c.valor, 0);
    return [
      { label: 'A receber (em aberto)', valor: totalReceber, tipo: 'entrada' },
      { label: 'A pagar (em aberto)', valor: totalPagar, tipo: 'saida' },
      { label: 'Contas vencidas', valor: vencidas, tipo: 'alerta' },
    ];
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }
}
