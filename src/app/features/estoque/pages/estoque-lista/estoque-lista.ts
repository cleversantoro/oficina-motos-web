import { DecimalPipe } from '@angular/common';
import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import {
  EstoqueCategoria,
  EstoqueFabricante,
  EstoqueLocalizacao,
  EstoquePeca,
} from '../../../../core/models';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import {
  DatatableAction,
  DatatableColumn,
  DatatableComponent,
} from '../../../../shared/ui/datatable';

type Filtro = { label: string; checked: boolean };

export type EstoqueTableRow = EstoquePeca &
  Record<string, unknown> & {
    fabricanteNome: string;
    categoriaNome: string;
    localizacaoNome: string;
  };

@Component({
  selector: 'app-estoque-lista',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink, DatatableComponent],
  templateUrl: './estoque-lista.html',
  styleUrl: './estoque-lista.scss',
})
export class EstoqueLista implements OnInit {
  @ViewChild('produtoTpl', { static: true }) produtoTpl?: TemplateRef<{ $implicit: EstoqueTableRow }>;
  @ViewChild('precoTpl', { static: true }) precoTpl?: TemplateRef<{ $implicit: EstoqueTableRow }>;
  @ViewChild('localizacaoTpl', { static: true }) localizacaoTpl?: TemplateRef<{ $implicit: EstoqueTableRow }>;
  @ViewChild('estoqueTpl', { static: true }) estoqueTpl?: TemplateRef<{ $implicit: EstoqueTableRow }>;

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

  columns: DatatableColumn<EstoqueTableRow>[] = [];

  readonly actions: DatatableAction<EstoqueTableRow>[] = [
    {
      id: 'view',
      icon: 'fa-solid fa-eye',
      label: 'Visualizar',
      variant: 'view',
      onClick: (item) => this.openDetalhe(item.id),
    },
    {
      id: 'delete',
      icon: 'fa-solid fa-trash',
      label: 'Excluir',
      variant: 'delete',
      visible: () => this.canDeleteItem(),
      onClick: (item) => {
        void this.confirmDelete(item.id);
      },
    },
  ];

  readonly statusFiltros: Filtro[] = [
    { label: 'Estoque baixo', checked: false },
    { label: 'Reposicao pendente', checked: false },
  ];

  constructor(
    private estoqueService: EstoqueService,
    private authService: AuthService,
    private confirmation: Confirmation,
    private toast: Toast,
    @Optional() private router?: Router,
  ) {}

  ngOnInit(): void {
    this.columns = [
      {
        field: 'descricao',
        header: 'Produto',
        subField: 'codigo',
        cellTemplate: this.produtoTpl,
      },
      {
        field: 'precoUnitario',
        header: 'Preço Venda',
        cellTemplate: this.precoTpl,
      },
      {
        field: 'fabricanteNome',
        header: 'Fabricante',
      },
      {
        field: 'localizacaoNome',
        header: 'Localização',
        cellTemplate: this.localizacaoTpl,
      },
      {
        field: 'quantidade',
        header: 'Estoque',
        cellTemplate: this.estoqueTpl,
      },
    ];

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
      if (
        this.selectedCategoriaIds.length > 0 &&
        (!i.categoriaId || !this.selectedCategoriaIds.includes(i.categoriaId))
      ) {
        return false;
      }
      if (
        this.selectedFabricanteIds.length > 0 &&
        (!i.fabricanteId || !this.selectedFabricanteIds.includes(i.fabricanteId))
      ) {
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

  get tableRows(): EstoqueTableRow[] {
    return this.filtered.map((item) => ({
      ...item,
      fabricanteNome: this.getFabricante(item.fabricanteId),
      categoriaNome: this.getCategoria(item.categoriaId),
      localizacaoNome: this.getLocalizacao(item.localizacaoId),
    }));
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

  openDetalhe(id: number): void {
    void this.router?.navigate(['/estoque', id]);
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
      error: () =>
        this.toast.error('Erro ao excluir', 'Não foi possível excluir o item do estoque.'),
    });
  }
}

export { EstoqueLista as EstoqueListaComponent };
