import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  CreateEstoqueMovimentacaoRequest,
  EstoqueMovimentacao,
  EstoquePeca,
  UpdateEstoquePecaRequest,
} from '../../../../core/models';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { Toast } from '../../../../shared/services/toast';
import {
  SIMPLE_BUTTON_IMPORTS,
  SIMPLE_DIALOG_IMPORTS,
} from '../../../../shared/ui/simple-primitives';

@Component({
  selector: 'app-estoque-entrada-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...SIMPLE_DIALOG_IMPORTS, ...SIMPLE_BUTTON_IMPORTS],
  templateUrl: './estoque-entrada-modal.html',
  styleUrl: './estoque-entrada-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstoqueEntradaModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly estoqueService = inject(EstoqueService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(Toast);

  @Input() visible = false;
  @Input({ required: true }) peca!: EstoquePeca;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<EstoqueMovimentacao>();

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    quantidade: [1, [Validators.required, Validators.min(1)]],
    referencia: ['', [Validators.required, Validators.maxLength(200)]],
  });

  get saldoProjetado(): number {
    const atual = Number(this.peca?.quantidade ?? 0);
    const qtd = Math.max(0, Math.floor(Number(this.form.controls.quantidade.value) || 0));
    return atual + qtd;
  }

  hasError(controlName: keyof typeof this.form.controls, errorKey?: string): boolean {
    const ctrl = this.form.controls[controlName];
    if (!ctrl || (!ctrl.touched && !ctrl.dirty)) return false;
    return errorKey ? ctrl.hasError(errorKey) : ctrl.invalid;
  }

  salvar(): void {
    this.form.markAllAsTouched();
    const raw = this.form.getRawValue();
    const referenciaLimpa = raw.referencia.trim();
    const quantidade = Math.floor(Number(raw.quantidade));

    if (this.form.invalid || !referenciaLimpa || quantidade < 1 || this.submitting() || !this.peca) {
      if (!referenciaLimpa) {
        this.form.controls.referencia.setErrors({ required: true });
      }
      return;
    }

    this.submitting.set(true);

    const user = this.authService.currentUser();
    const usuarioNome = user?.name || user?.email || 'Sistema';

    const movPayload: CreateEstoqueMovimentacaoRequest = {
      pecaId: this.peca.id,
      quantidade,
      tipo: 'ENTRADA',
      referencia: referenciaLimpa,
      usuario: usuarioNome,
    };

    const novaQuantidade = (this.peca.quantidade ?? 0) + quantidade;
    const updatePecaPayload: UpdateEstoquePecaRequest = {
      codigo: this.peca.codigo,
      descricao: this.peca.descricao,
      fabricanteId: this.peca.fabricanteId,
      categoriaId: this.peca.categoriaId,
      localizacaoId: this.peca.localizacaoId,
      precoUnitario: this.peca.precoUnitario,
      quantidade: novaQuantidade,
      estoqueMinimo: this.peca.estoqueMinimo,
      estoqueMaximo: this.peca.estoqueMaximo,
      unidade: this.peca.unidade,
      status: this.peca.status,
      observacoes: this.peca.observacoes,
    };

    let createdMov: EstoqueMovimentacao;

    this.estoqueService
      .movimentar(movPayload)
      .pipe(
        switchMap((mov: any) => {
          createdMov = mov as EstoqueMovimentacao;
          return this.estoqueService.atualizarPeca(this.peca.id, updatePecaPayload);
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('Entrada de estoque registrada com sucesso!');
          this.saved.emit(createdMov);
          this.fechar();
        },
        error: (err: any) => {
          const msg =
            err?.error?.message ??
            err?.error?.title ??
            'Não foi possível registrar a entrada de estoque.';
          this.toast.error(msg);
        },
      });
  }

  fechar(): void {
    this.form.reset({ quantidade: 1, referencia: '' });
    this.submitting.set(false);
    this.visible = false;
    this.visibleChange.emit(false);
  }
}

export { EstoqueEntradaModalComponent as EstoqueEntradaModal };

