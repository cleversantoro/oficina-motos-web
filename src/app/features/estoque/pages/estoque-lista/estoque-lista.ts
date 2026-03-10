import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { EstoquePeca, EstoqueCategoria, EstoqueFabricante, EstoqueLocalizacao } from '../../../../core/models';

type Filtro = { label: string; checked: boolean };

@Component({
  selector: 'app-estoque-lista',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './estoque-lista.html',
  styleUrl: './estoque-lista.scss',
  providers: [EstoqueService]
})
export class EstoqueLista implements OnInit {
  itens: EstoquePeca[] = [];
  categorias: EstoqueCategoria[] = [];
  fabricantes: EstoqueFabricante[] = [];
  localizacoes: EstoqueLocalizacao[] = [];
  loading = false;

  readonly statusFiltros: Filtro[] = [
    { label: 'Estoque baixo', checked: false },
    { label: 'Reposicao pendente', checked: false },
  ];

  constructor(private estoqueService: EstoqueService) {}

  ngOnInit(): void {
    this.loading = true;
    this.estoqueService.pecas().subscribe({
      next: (resp: any) => { this.itens = resp; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.estoqueService.categorias().subscribe({
      next: (resp: any) => { this.categorias = resp; }
    });
    this.estoqueService.fabricantes().subscribe({
      next: (resp: any) => { this.fabricantes = resp; }
    });
    this.estoqueService.localizacoes().subscribe({
      next: (resp: any) => { this.localizacoes = resp; }
    });
  }

  get estatisticas() {
    const valorTotal = this.itens.reduce((s, i) => s + (i.precoUnitario * i.quantidade), 0);
    const criticos = this.itens.filter(i => i.quantidade <= i.estoqueMinimo).length;
    return [
      { label: 'Valor em estoque', valor: `R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, alerta: false },
      { label: 'Estoque cr\u00edtico', valor: `${criticos} itens`, alerta: criticos > 0 },
      { label: 'Total de SKUs', valor: String(this.itens.length) },
    ];
  }

  isCritico(item: EstoquePeca): boolean {
    return item.quantidade <= item.estoqueMinimo;
  }

  getCategoria(id: number | null): string {
    if (!id) return '-';
    return this.categorias.find(c => c.id === id)?.nome ?? String(id);
  }

  getFabricante(id: number | null): string {
    if (!id) return '-';
    return this.fabricantes.find(f => f.id === id)?.nome ?? String(id);
  }

  getLocalizacao(id: number | null): string {
    if (!id) return '-';
    return this.localizacoes.find(l => l.id === id)?.descricao ?? String(id);
  }
}
