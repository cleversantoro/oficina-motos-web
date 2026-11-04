import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import {
  EstoqueCategoria,
  EstoqueFabricante,
  EstoqueLocalizacao,
  Fornecedor,
} from '../../../../core/models';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { Toast } from '../../../../shared/services/toast';

@Component({
  selector: 'app-estoque-peca-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './estoque-peca-cadastro.html',
  styleUrl: './estoque-peca-cadastro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstoquePecaCadastroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly estoqueService = inject(EstoqueService);
  private readonly fornecedoresService = inject(FornecedoresService);
  private readonly toast = inject(Toast);

  readonly loading = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly categorias = signal<EstoqueCategoria[]>([]);
  readonly fabricantes = signal<EstoqueFabricante[]>([]);
  readonly localizacoes = signal<EstoqueLocalizacao[]>([]);
  readonly fornecedores = signal<Fornecedor[]>([]);

  readonly unidadesOpcoes = [
    { value: 'UN', label: 'Unidade (UN)' },
    { value: 'PAR', label: 'Par (PAR)' },
    { value: 'KIT', label: 'Kit / Jogo (KIT)' },
    { value: 'LT', label: 'Litro (LT)' },
    { value: 'MT', label: 'Metro (MT)' },
    { value: 'KG', label: 'Quilograma (KG)' },
  ];

  readonly statusOpcoes = [
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' },
  ];

  readonly form = this.fb.nonNullable.group({
    codigo: ['PEC-001', [Validators.required, Validators.maxLength(40)]],
    descricao: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    unidade: ['UN', [Validators.required]],
    status: ['Ativo', [Validators.required]],
    categoriaId: [null as number | null],
    fabricanteId: [null as number | null],
    fornecedorId: [null as number | null],
    localizacaoId: [null as number | null],
    precoUnitario: [null as number | null, [Validators.required, Validators.min(0.01)]],
    precoFornecedor: [null as number | null, [Validators.min(0)]],
    prazoEntregaFornecedor: [null as number | null, [Validators.min(0)]],
    quantidade: [0, [Validators.required, Validators.min(0)]],
    estoqueMinimo: [5, [Validators.required, Validators.min(0)]],
    estoqueMaximo: [50, [Validators.required, Validators.min(0)]],
    observacoes: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais(): void {
    this.loading.set(true);

    forkJoin({
      categorias: this.estoqueService.categorias().pipe(catchError(() => of([]))),
      fabricantes: this.estoqueService.fabricantes().pipe(catchError(() => of([]))),
      localizacoes: this.estoqueService.localizacoes().pipe(catchError(() => of([]))),
      fornecedores: this.fornecedoresService.list().pipe(catchError(() => of([]))),
      pecas: this.estoqueService.pecas().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ categorias, fabricantes, localizacoes, fornecedores, pecas }: any) => {
        const listaCategorias: EstoqueCategoria[] = Array.isArray(categorias)
          ? categorias
          : categorias?.data ?? [];
        const listaFabricantes: EstoqueFabricante[] = Array.isArray(fabricantes)
          ? fabricantes
          : fabricantes?.data ?? [];
        const listaLocalizacoes: EstoqueLocalizacao[] = Array.isArray(localizacoes)
          ? localizacoes
          : localizacoes?.data ?? [];
        const listaFornecedores: Fornecedor[] = Array.isArray(fornecedores)
          ? fornecedores
          : fornecedores?.data ?? [];
        const listaPecas = Array.isArray(pecas) ? pecas : pecas?.data ?? [];

        this.categorias.set(listaCategorias);
        this.fabricantes.set(listaFabricantes);
        this.localizacoes.set(listaLocalizacoes);
        this.fornecedores.set(
          listaFornecedores.filter((f) => f.status?.toUpperCase() !== 'INATIVO')
        );

        const nextNum = listaPecas.length + 1;
        this.form.controls.codigo.setValue(`PEC-${String(nextNum).padStart(3, '0')}`);
      });
  }

  hasError(controlName: keyof typeof this.form.controls, errorKey?: string): boolean {
    const ctrl = this.form.controls[controlName];
    if (!ctrl || (!ctrl.touched && !ctrl.dirty)) return false;
    return errorKey ? ctrl.hasError(errorKey) : ctrl.invalid;
  }

  private parseNullableNumber(val: number | string | null | undefined): number | null {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  }

  cancelar(): void {
    this.router.navigate(['/estoque']);
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const categoriaId = this.parseNullableNumber(raw.categoriaId);
    const fabricanteId = this.parseNullableNumber(raw.fabricanteId);
    const localizacaoId = this.parseNullableNumber(raw.localizacaoId);
    const fornecedorId = this.parseNullableNumber(raw.fornecedorId);

    const payload = {
      codigo: raw.codigo.trim(),
      descricao: raw.descricao.trim(),
      fabricanteId,
      categoriaId,
      localizacaoId,
      precoUnitario: Number(raw.precoUnitario),
      quantidade: Number(raw.quantidade),
      estoqueMinimo: Number(raw.estoqueMinimo),
      estoqueMaximo: Number(raw.estoqueMaximo),
      unidade: raw.unidade,
      status: raw.status,
      observacoes: raw.observacoes.trim() || null,
    };

    this.estoqueService
      .criarPeca(payload)
      .pipe(
        switchMap((created: any) => {
          const pecaId = created?.id;
          if (!pecaId || !fornecedorId) {
            return of(created);
          }

          return this.estoqueService
            .vincularFornecedor({
              pecaId,
              fornecedorId,
              preco: this.parseNullableNumber(raw.precoFornecedor),
              prazoEntrega: this.parseNullableNumber(raw.prazoEntregaFornecedor),
              observacao: 'Fornecedor vinculado no cadastro da peça',
            })
            .pipe(catchError(() => of(created)));
        }),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.success('Peça cadastrada no estoque com sucesso!');
          this.router.navigate(['/estoque']);
        },
        error: (err: any) => {
          const msg =
            err?.error?.message ??
            err?.error?.title ??
            'Não foi possível cadastrar a peça. Verifique os dados informados.';
          this.toast.error(msg);
        },
      });
  }
}

export { EstoquePecaCadastroComponent as EstoquePecaCadastro };

