import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  Cliente,
  CreateFinanceiroContaReceberRequest,
  FinanceiroContaReceber,
  FinanceiroMetodoPagamento,
} from '../../../../core/models';
import { ClientesService } from '../../../../core/services/clientes.service';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { Toast } from '../../../../shared/services/toast';

export type ContaReceberStatusOption = 'PENDENTE' | 'VENCIDO' | 'RECEBIDO' | 'CANCELADO';

@Component({
  selector: 'app-contas-receber-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contas-receber-form.html',
  styleUrl: './contas-receber-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContasReceberFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly clientesService = inject(ClientesService);
  private readonly toast = inject(Toast);

  readonly loading = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly contaId = signal<number | null>(null);
  readonly isEditMode = computed<boolean>(() => this.contaId() !== null);

  readonly clientes = signal<Cliente[]>([]);
  readonly metodos = signal<FinanceiroMetodoPagamento[]>([]);

  readonly statusOptions: { value: ContaReceberStatusOption; label: string }[] = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'VENCIDO', label: 'Vencido' },
    { value: 'RECEBIDO', label: 'Recebido' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  readonly form = this.fb.group({
    descricao: ['', [Validators.required, Validators.maxLength(240)]],
    clienteId: [null as number | null],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    vencimento: ['', [Validators.required]],
    status: ['PENDENTE' as string, [Validators.required, Validators.maxLength(50)]],
    metodoId: [null as number | null],
    dataRecebimento: [''],
    observacao: ['', [Validators.maxLength(240)]],
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    if (rawId !== null && rawId.trim() !== '') {
      const parsedId = Number(rawId);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        this.error.set('Identificador de conta a receber inválido.');
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
        conta: this.financeiroService.getContaReceberById(id),
        clientes: this.clientesService.list().pipe(catchError(() => of([]))),
        metodos: this.financeiroService.metodos().pipe(catchError(() => of([]))),
      })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: ({ conta, clientes, metodos }) => {
            this.clientes.set(this.extractArray<Cliente>(clientes));
            this.metodos.set(this.extractArray<FinanceiroMetodoPagamento>(metodos));
            this.preencherFormulario(conta);
          },
          error: () => {
            this.error.set('Não foi possível carregar os dados da conta a receber solicitada.');
          },
        });
      return;
    }

    forkJoin({
      clientes: this.clientesService.list().pipe(catchError(() => of([]))),
      metodos: this.financeiroService.metodos().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ clientes, metodos }) => {
        this.clientes.set(this.extractArray<Cliente>(clientes));
        this.metodos.set(this.extractArray<FinanceiroMetodoPagamento>(metodos));
      });
  }

  preencherFormulario(conta: FinanceiroContaReceber): void {
    const normalizedStatus = this.normalizeStatus(conta.status);
    this.form.patchValue({
      descricao: conta.descricao ?? '',
      clienteId: conta.clienteId ?? null,
      valor: conta.valor ?? null,
      vencimento: this.toDateInputValue(conta.vencimento),
      status: normalizedStatus,
      metodoId: conta.metodoId ?? null,
      dataRecebimento: this.toDateInputValue(conta.dataRecebimento),
      observacao: conta.observacao ?? '',
    });
  }

  onStatusChange(): void {
    const currentStatus = this.normalizeStatus(this.form.controls.status.value);
    const currentDataRecebimento = (this.form.controls.dataRecebimento.value ?? '').trim();
    if (currentStatus === 'RECEBIDO' && !currentDataRecebimento) {
      this.form.controls.dataRecebimento.setValue(this.getTodayDateKey());
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
    this.router.navigate(['/financeiro/contas-receber']);
  }

  salvar(): void {
    const descricaoVal = (this.form.controls.descricao.value ?? '').trim();
    this.form.controls.descricao.setValue(descricaoVal);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.submitting()) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateFinanceiroContaReceberRequest = {
      descricao: (raw.descricao ?? '').trim(),
      clienteId: this.parseNullableNumber(raw.clienteId),
      valor: Number(raw.valor),
      vencimento: (raw.vencimento ?? '').trim(),
      status: this.normalizeStatus(raw.status),
      metodoId: this.parseNullableNumber(raw.metodoId),
      dataRecebimento: (raw.dataRecebimento ?? '').trim() ? (raw.dataRecebimento ?? '').trim() : null,
      observacao: (raw.observacao ?? '').trim() ? (raw.observacao ?? '').trim() : null,
    };

    this.submitting.set(true);
    this.error.set(null);

    const id = this.contaId();
    const request$ =
      id !== null
        ? this.financeiroService.updateContaReceber(id, payload)
        : this.financeiroService.createContaReceber(payload);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        if (id !== null) {
          this.toast.success('Conta atualizada', 'As alterações da conta a receber foram salvas com sucesso.');
        } else {
          this.toast.success('Conta criada', 'A nova conta a receber foi registrada com sucesso.');
        }
        this.router.navigate(['/financeiro/contas-receber']);
      },
      error: () => {
        const msg =
          id !== null
            ? 'Não foi possível salvar as alterações da conta a receber.'
            : 'Não foi possível criar a conta a receber.';
        this.toast.error('Erro ao salvar', msg);
      },
    });
  }

  getClienteLabel(cliente: Cliente): string {
    return cliente.nomeExibicao || cliente.nome || `Cliente #${cliente.id}`;
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

  private normalizeStatus(status: string | null | undefined): ContaReceberStatusOption {
    const upper = (status ?? '').trim().toUpperCase();
    if (upper === 'RECEBIDO' || upper === 'PAGO' || upper === 'LIQUIDADO') {
      return 'RECEBIDO';
    }
    if (upper === 'VENCIDO' || upper === 'CANCELADO') {
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
