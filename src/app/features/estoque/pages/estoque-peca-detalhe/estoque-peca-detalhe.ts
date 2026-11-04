import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  EstoqueCategoria,
  EstoqueFabricante,
  EstoqueLocalizacao,
  EstoqueMovimentacao,
  EstoquePeca,
} from '../../../../core/models';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { EstoqueEntradaModalComponent } from '../../components/estoque-entrada-modal/estoque-entrada-modal';
import { EstoqueSaidaModalComponent } from '../../components/estoque-saida-modal/estoque-saida-modal';

@Component({
  selector: 'app-estoque-peca-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    DatePipe,
    RouterLink,
    EstoqueEntradaModalComponent,
    EstoqueSaidaModalComponent,
  ],
  templateUrl: './estoque-peca-detalhe.html',
  styleUrl: './estoque-peca-detalhe.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstoquePecaDetalheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estoqueService = inject(EstoqueService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly peca = signal<EstoquePeca | null>(null);
  readonly movimentacoes = signal<EstoqueMovimentacao[]>([]);
  readonly categorias = signal<EstoqueCategoria[]>([]);
  readonly fabricantes = signal<EstoqueFabricante[]>([]);
  readonly localizacoes = signal<EstoqueLocalizacao[]>([]);

  readonly entradaModalVisible = signal(false);
  readonly saidaModalVisible = signal(false);

  readonly isCritico = computed(() => {
    const p = this.peca();
    return !!p && p.quantidade < p.estoqueMinimo;
  });

  readonly valorTotalEstoque = computed(() => {
    const p = this.peca();
    if (!p) return 0;
    return (p.precoUnitario ?? 0) * (p.quantidade ?? 0);
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = Number(rawId);
    if (!rawId || Number.isNaN(id) || id <= 0) {
      this.loading.set(false);
      this.error.set('Identificador de peça inválido.');
      return;
    }

    this.carregarDados(id);
  }

  carregarDados(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      peca: this.estoqueService.getPeca(id),
      movimentacoes: this.estoqueService.listarMovimentacoes({ pecaId: id }).pipe(catchError(() => of([]))),
      categorias: this.estoqueService.categorias().pipe(catchError(() => of([]))),
      fabricantes: this.estoqueService.fabricantes().pipe(catchError(() => of([]))),
      localizacoes: this.estoqueService.localizacoes().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ peca, movimentacoes, categorias, fabricantes, localizacoes }: any) => {
          const pecaObj = (peca?.data ?? peca) as EstoquePeca;
          const listaMovs: EstoqueMovimentacao[] = Array.isArray(movimentacoes)
            ? movimentacoes
            : movimentacoes?.data ?? [];
          const listaCategorias: EstoqueCategoria[] = Array.isArray(categorias)
            ? categorias
            : categorias?.data ?? [];
          const listaFabricantes: EstoqueFabricante[] = Array.isArray(fabricantes)
            ? fabricantes
            : fabricantes?.data ?? [];
          const listaLocalizacoes: EstoqueLocalizacao[] = Array.isArray(localizacoes)
            ? localizacoes
            : localizacoes?.data ?? [];

          this.peca.set(pecaObj);
          this.categorias.set(listaCategorias);
          this.fabricantes.set(listaFabricantes);
          this.localizacoes.set(listaLocalizacoes);

          const filtradas = listaMovs
            .filter((m) => Number(m.pecaId) === Number(id))
            .sort(
              (a, b) =>
                new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime(),
            );

          this.movimentacoes.set(filtradas);
        },
        error: (err: any) => {
          this.error.set(
            err?.error?.message ?? 'Não foi possível carregar os detalhes da peça.',
          );
        },
      });
  }

  getCategoriaNome(id: number | null): string {
    if (!id) return '—';
    return this.categorias().find((c) => c.id === id)?.nome ?? String(id);
  }

  getFabricanteNome(id: number | null): string {
    if (!id) return '—';
    return this.fabricantes().find((f) => f.id === id)?.nome ?? String(id);
  }

  getLocalizacaoNome(id: number | null): string {
    if (!id) return '—';
    return this.localizacoes().find((l) => l.id === id)?.descricao ?? String(id);
  }

  abrirModalEntrada(): void {
    this.entradaModalVisible.set(true);
  }

  abrirModalSaida(): void {
    this.saidaModalVisible.set(true);
  }

  onMovimentacaoSalva(): void {
    const p = this.peca();
    if (p) {
      this.carregarDados(p.id);
    }
  }

  voltar(): void {
    this.router.navigate(['/estoque']);
  }
}

export { EstoquePecaDetalheComponent as EstoquePecaDetalhe };

