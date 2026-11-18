import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import {
  EstoquePeca,
  EstoqueCategoria,
  EstoqueFabricante,
  EstoqueLocalizacao,
} from '../../../../core/models';

type Filtro = { label: string; checked: boolean };

@Component({
  selector: 'app-estoque-lista',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink],
  templateUrl: './estoque-lista.html',
  styleUrl: './estoque-lista.scss',
})
export class EstoqueLista implements OnInit {
  itens: EstoquePeca[] = [];
  categorias: EstoqueCategoria[] = [];
  fabricantes: EstoqueFabricante[] = [];
  localizacoes: EstoqueLocalizacao[] = [];
  loading = false;
  filterText = '';
  selectedCategoriaIds: number[] = [];
  selectedFabricanteIds: number[] = [];
  first = 0;
  rows = 5;

  readonly statusFiltros: Filtro[] = [
    { label: 'Estoque baixo', checked: false },
    { label: 'Reposicao pendente', checked: false },
  ];

  constructor(
    private estoqueService: EstoqueService,
    private authService: AuthService,
    private confirmation: Confirmation,
    private toast: Toast,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.estoqueService.pecas().subscribe({
      next: (resp: any) => {
        this.itens = Array.isArray(resp) ? resp : resp?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.estoqueService.categorias().subscribe({
      next: (resp: any) => {
        this.categorias = Array.isArray(resp) ? resp : resp?.data ?? [];
      },
    });
    this.estoqueService.fabricantes().subscribe({
      next: (resp: any) => {
        this.fabricantes = Array.isArray(resp) ? resp : resp?.data ?? [];
      },
    });
    this.estoqueService.localizacoes().subscribe({
      next: (resp: any) => {
        this.localizacoes = Array.isArray(resp) ? resp : resp?.data ?? [];
      },
    });
  }

  get estatisticas() {
    const valorTotal = this.itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
    const criticos = this.itens.filter((i) => this.isCritico(i)).length;
    return [
      {
        label: 'Valor em estoque',
        valor: `R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        alerta: false,
      },
      { label: 'Estoque cr\u00edtico', valor: `${criticos} itens`, alerta: criticos > 0 },
      { label: 'Total de SKUs', valor: String(this.itens.length) },
    ];
  }

  get filtered(): EstoquePeca[] {
    const q = this.filterText.trim().toLowerCase();
    const filtroBaixo = this.statusFiltros[0]?.checked;
    const filtroReposicao = this.statusFiltros[1]?.checked;

    return this.itens.filter((i) => {
      if (this.selectedCategoriaIds.length > 0 && (!i.categoriaId || !this.selectedCategoriaIds.includes(i.categoriaId))) {
        return false;
      }
      if (this.selectedFabricanteIds.length > 0 && (!i.fabricanteId || !this.selectedFabricanteIds.includes(i.fabricanteId))) {
        return false;
      }
      if (filtroBaixo && !this.isCritico(i)) {
        return false;
      }
      if (filtroReposicao && i.quantidade > i.estoqueMinimo) {
        return false;
      }
      if (!q) return true;
      return (
        (i.descricao ?? '').toLowerCase().includes(q) ||
        (i.codigo ?? '').toLowerCase().includes(q)
      );
    });
  }

  toggleCategoria(id: number): void {
    this.selectedCategoriaIds = this.selectedCategoriaIds.includes(id)
      ? this.selectedCategoriaIds.filter((c) => c !== id)
      : [...this.selectedCategoriaIds, id];
    this.first = 0;
  }

  toggleFabricante(id: number): void {
    this.selectedFabricanteIds = this.selectedFabricanteIds.includes(id)
      ? this.selectedFabricanteIds.filter((f) => f !== id)
      : [...this.selectedFabricanteIds, id];
    this.first = 0;
  }

  toggleStatusFiltro(filtro: Filtro): void {
    filtro.checked = !filtro.checked;
    this.first = 0;
  }

  isCritico(item: EstoquePeca): boolean {
    return item.quantidade < item.estoqueMinimo;
  }

  canDeleteItem(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'estoque', 'delete');
  }

  getCategoria(id: number | null): string {
    if (!id) return '-';
    return this.categorias.find((c) => c.id === id)?.nome ?? String(id);
  }

  getFabricante(id: number | null): string {
    if (!id) return '-';
    return this.fabricantes.find((f) => f.id === id)?.nome ?? String(id);
  }

  getLocalizacao(id: number | null): string {
    if (!id) return '-';
    return this.localizacoes.find((l) => l.id === id)?.descricao ?? String(id);
  }

  prevPage(): void {
    this.first = Math.max(0, this.first - this.rows);
  }
  nextPage(): void {
    if (this.first + this.rows < this.filtered.length) this.first += this.rows;
  }

  get pageEnd(): number {
    const end = this.first + this.rows;
    return end > this.filtered.length ? this.filtered.length : end;
  }

  async confirmDelete(id: number): Promise<void> {
    const item = this.itens.find((i) => i.id === id);
    const confirmado = await this.confirmation.confirmDelete(item?.descricao || `Item #${id}`);
    if (!confirmado) return;
    this.estoqueService.removerPeca(id).subscribe({
      next: () => {
        this.itens = this.itens.filter((i) => i.id !== id);
        this.toast.success('Item excluído', 'Item removido do estoque com sucesso.');
      },
      error: () => this.toast.error('Erro ao excluir', 'Não foi possível excluir o item do estoque.'),
    });
  }
}

export { EstoqueLista as EstoqueListaComponent };
