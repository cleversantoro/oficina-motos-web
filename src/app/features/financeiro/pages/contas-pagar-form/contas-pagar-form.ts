import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  CreateFinanceiroContaPagarRequest,
  FinanceiroContaPagar,
  FinanceiroMetodoPagamento,
  Fornecedor,
} from '../../../../core/models';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { Toast } from '../../../../shared/services/toast';

export type ContaPagarStatusOption = 'PENDENTE' | 'VENCIDO' | 'PAGO' | 'CANCELADO';

@Component({
  selector: 'app-contas-pagar-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contas-pagar-form.html',
  styleUrl: './contas-pagar-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContasPagarFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly fornecedoresService = inject(FornecedoresService);
  private readonly toast = inject(Toast);

  readonly loading = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly contaId = signal<number | null>(null);
  readonly isEditMode = computed<boolean>(() => this.contaId() !== null);

  readonly fornecedores = signal<Fornecedor[]>([]);
  readonly metodos = signal<FinanceiroMetodoPagamento[]>([]);

  readonly statusOptions: { value: ContaPagarStatusOption; label: string }[] = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'VENCIDO', label: 'Vencido' },
    { value: 'PAGO', label: 'Pago' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  readonly form = this.fb.group({
    descricao: ['', [Validators.required, Validators.maxLength(240)]],
    fornecedorId: [null as number | null],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    vencimento: ['', [Validators.required]],
    status: ['PENDENTE' as string, [Validators.required, Validators.maxLength(50)]],
    metodoId: [null as number | null],
    dataPagamento: [''],
    observacao: ['', [Validators.maxLength(240)]],
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    if (rawId !== null && rawId.trim() !== '') {
      const parsedId = Number(rawId);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        this.error.set('Identificador de conta a pagar inválido.');
        return;
      }
      this.contaId.set(parsedId);
    }

    this.carregarDados();
  }

  carregarDados(): void {
    const id = this.contaId();
    this.loading.set(true);
    this.error.set(null);

    if (id !== null) {
      forkJoin({
        conta: this.financeiroService.getContaPagarById(id),
        fornecedores: this.fornecedoresService.list().pipe(catchError(() => of([]))),
        metodos: this.financeiroService.metodos().pipe(catchError(() => of([]))),
      })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: ({ conta, fornecedores, metodos }) => {
            this.fornecedores.set(this.extractArray<Fornecedor>(fornecedores));
            this.metodos.set(this.extractArray<FinanceiroMetodoPagamento>(metodos));
            this.preencherFormulario(conta);
          },
          error: () => {
            this.error.set('Não foi possível carregar os dados da conta a pagar solicitada.');
          },
        });
      return;
    }

    forkJoin({
      fornecedores: this.fornecedoresService.list().pipe(catchError(() => of([]))),
      metodos: this.financeiroService.metodos().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ fornecedores, metodos }) => {
        this.fornecedores.set(this.extractArray<Fornecedor>(fornecedores));
        this.metodos.set(this.extractArray<FinanceiroMetodoPagamento>(metodos));
      });
  }

  preencherFormulario(conta: FinanceiroContaPagar): void {
    const normalizedStatus = this.normalizeStatus(conta.status);
    this.form.patchValue({
      descricao: conta.descricao ?? '',
      fornecedorId: conta.fornecedorId ?? null,
      valor: conta.valor ?? null,
      vencimento: this.toDateInputValue(conta.vencimento),
      status: normalizedStatus,
      metodoId: conta.metodoId ?? null,
      dataPagamento: this.toDateInputValue(conta.dataPagamento),
      observacao: conta.observacao ?? '',
    });
  }

  onStatusChange(): void {
    const currentStatus = (this.form.controls.status.value ?? '').trim().toUpperCase();
    const currentDataPagamento = (this.form.controls.dataPagamento.value ?? '').trim();
    if (currentStatus === 'PAGO' && !currentDataPagamento) {
      this.form.controls.dataPagamento.setValue(this.getTodayDateKey());
    }
  }

  hasError(controlName: keyof typeof this.form.controls, errorKey?: string): boolean {
    const ctrl = this.form.controls[controlName];
    if (!ctrl || (!ctrl.touched && !ctrl.dirty)) {
      return false;
    }
    return errorKey ? ctrl.hasError(errorKey) : ctrl.invalid;
  }

  cancelar(): void {
    this.router.navigate(['/financeiro/contas-pagar']);
  }

  salvar(): void {
    const descricaoVal = (this.form.controls.descricao.value ?? '').trim();
    this.form.controls.descricao.setValue(descricaoVal);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.submitting()) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateFinanceiroContaPagarRequest = {
      descricao: (raw.descricao ?? '').trim(),
      fornecedorId: this.parseNullableNumber(raw.fornecedorId),
      valor: Number(raw.valor),
      vencimento: (raw.vencimento ?? '').trim(),
      status: this.normalizeStatus(raw.status),
      metodoId: this.parseNullableNumber(raw.metodoId),
      dataPagamento: (raw.dataPagamento ?? '').trim() ? (raw.dataPagamento ?? '').trim() : null,
      observacao: (raw.observacao ?? '').trim() ? (raw.observacao ?? '').trim() : null,
    };

    this.submitting.set(true);
    this.error.set(null);

    const id = this.contaId();
    const request$ =
      id !== null
        ? this.financeiroService.updateContaPagar(id, payload)
        : this.financeiroService.createContaPagar(payload);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        if (id !== null) {
          this.toast.success('Conta atualizada', 'As alterações da conta a pagar foram salvas com sucesso.');
        } else {
          this.toast.success('Conta criada', 'A nova conta a pagar foi registrada com sucesso.');
        }
        this.router.navigate(['/financeiro/contas-pagar']);
      },
      error: () => {
        const msg =
          id !== null
            ? 'Não foi possível salvar as alterações da conta a pagar.'
            : 'Não foi possível criar a conta a pagar.';
        this.toast.error('Erro ao salvar', msg);
      },
    });
  }

  getFornecedorLabel(fornecedor: Fornecedor): string {
    return fornecedor.nomeFantasia || fornecedor.razaoSocial || `Fornecedor #${fornecedor.id}`;
  }

  toDateInputValue(dateValue: string | null | undefined): string {
    if (!dateValue) {
      return '';
    }
    const trimmed = dateValue.trim();
    const isoMatch = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
    if (isoMatch) {
      return isoMatch[1];
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getTodayDateKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizeStatus(status: string | null | undefined): ContaPagarStatusOption {
    const upper = (status ?? '').trim().toUpperCase();
    if (upper === 'PAGO' || upper === 'VENCIDO' || upper === 'CANCELADO') {
      return upper;
    }
    return 'PENDENTE';
  }

  private parseNullableNumber(val: number | string | null | undefined): number | null {
    if (val === null || val === undefined || val === '') {
      return null;
    }
    const num = Number(val);
    return Number.isNaN(num) || num <= 0 ? null : num;
  }

  private extractArray<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }
    if (response && typeof response === 'object' && Array.isArray((response as { data?: unknown }).data)) {
      return (response as { data: T[] }).data;
    }
    return [];
  }
}
