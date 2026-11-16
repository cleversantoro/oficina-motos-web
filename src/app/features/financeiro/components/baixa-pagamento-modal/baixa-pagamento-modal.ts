import { CommonModule, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  BaixaContaAlvo,
  ContaPagarPagamentoResponse,
  ContaReceberPagamentoResponse,
  CreateContaPagarPagamentoRequest,
  CreateContaReceberPagamentoRequest,
  FinanceiroMetodoPagamento,
} from '../../../../core/models';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { Toast } from '../../../../shared/services/toast';

export type BaixaPagamentoResult = ContaPagarPagamentoResponse | ContaReceberPagamentoResponse;

@Component({
  selector: 'app-baixa-pagamento-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ReactiveFormsModule],
  templateUrl: './baixa-pagamento-modal.html',
  styleUrl: './baixa-pagamento-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaixaPagamentoModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly toast = inject(Toast);

  @Input() visible = false;
  @Input() conta: BaixaContaAlvo | null = null;
  @Input() metodos: FinanceiroMetodoPagamento[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() baixaRegistrada = new EventEmitter<BaixaPagamentoResult>();

  readonly submitting = signal<boolean>(false);
  readonly contaSignal = signal<BaixaContaAlvo | null>(null);
  readonly metodosSignal = signal<FinanceiroMetodoPagamento[]>([]);
  readonly valorDigitado = signal<number>(0);

  private readonly fallbackMetodos: FinanceiroMetodoPagamento[] = [
    { id: 901, nome: 'Dinheiro', descricao: 'Pagamento em espécie' },
    { id: 902, nome: 'Cartão de Crédito', descricao: 'Crédito à vista ou parcelado' },
    { id: 903, nome: 'Cartão de Débito', descricao: 'Débito imediato' },
    { id: 904, nome: 'PIX', descricao: 'Transferência instantânea PIX' },
    { id: 905, nome: 'Boleto Bancário', descricao: 'Boleto bancário' },
    { id: 906, nome: 'Transferência / TED', descricao: 'Transferência bancária' },
  ];

  readonly metodosDisponiveis = computed<FinanceiroMetodoPagamento[]>(() => {
    const lista = this.metodosSignal();
    return lista.length > 0 ? lista : this.fallbackMetodos;
  });

  readonly saldoAtual = computed<number>(() => {
    const c = this.contaSignal();
    const val = Number(c?.valor);
    return Number.isFinite(val) && val > 0 ? this.roundMoney(val) : 0;
  });

  readonly valorExcedente = computed<boolean>(() => {
    const pago = this.roundMoney(this.valorDigitado());
    const saldo = this.saldoAtual();
    return saldo > 0 && pago > saldo;
  });

  readonly saldoResidual = computed<number>(() => {
    const saldo = this.saldoAtual();
    const pago = this.roundMoney(this.valorDigitado());
    if (pago <= 0) {
      return saldo;
    }
    if (pago >= saldo) {
      return 0;
    }
    return this.roundMoney(saldo - pago);
  });

  readonly isParcial = computed<boolean>(() => {
    const pago = this.roundMoney(this.valorDigitado());
    const saldo = this.saldoAtual();
    return pago > 0 && pago < saldo && this.saldoResidual() > 0;
  });

  readonly isIntegral = computed<boolean>(() => {
    const pago = this.roundMoney(this.valorDigitado());
    const saldo = this.saldoAtual();
    return saldo > 0 && pago === saldo && this.saldoResidual() === 0;
  });

  readonly form = this.fb.group({
    dataPagamento: [this.getTodayDateKey(), [Validators.required]],
    valorPago: [null as number | null, [Validators.required, Validators.min(0.01)]],
    metodoId: [null as number | null, [Validators.required, Validators.min(1)]],
    observacao: ['', [Validators.maxLength(240)]],
  });

  constructor() {
    this.form.controls.valorPago.valueChanges.subscribe((val) => {
      const parsed = Number(val);
      this.valorDigitado.set(Number.isFinite(parsed) ? parsed : 0);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metodos']) {
      this.metodosSignal.set(Array.isArray(this.metodos) ? this.metodos : []);
    }
    if (changes['conta']) {
      this.contaSignal.set(this.conta);
    }
    if ((changes['visible'] && this.visible) || (changes['conta'] && this.visible && this.conta)) {
      this.inicializarFormulario();
    }
  }

  inicializarFormulario(): void {
    const c = this.conta;
    this.contaSignal.set(c);
    this.metodosSignal.set(Array.isArray(this.metodos) ? this.metodos : []);

    const saldoInicial = c && Number(c.valor) > 0 ? this.roundMoney(Number(c.valor)) : null;
    const opcoesMetodos = this.metodosDisponiveis();
    const metodoPadrao =
      c?.metodoId && opcoesMetodos.some((m) => m.id === c.metodoId)
        ? c.metodoId
        : (opcoesMetodos[0]?.id ?? null);

    this.form.reset({
      dataPagamento: this.getTodayDateKey(),
      valorPago: saldoInicial,
      metodoId: metodoPadrao,
      observacao: '',
    });
    this.valorDigitado.set(saldoInicial ?? 0);
    this.submitting.set(false);
  }

  preencherValorIntegral(): void {
    const total = this.saldoAtual();
    if (total > 0) {
      this.form.controls.valorPago.setValue(total);
      this.form.controls.valorPago.markAsDirty();
      this.valorDigitado.set(total);
    }
  }

  hasError(controlName: keyof typeof this.form.controls, errorKey?: string): boolean {
    const ctrl = this.form.controls[controlName];
    if (!ctrl || (!ctrl.touched && !ctrl.dirty)) {
      return false;
    }
    return errorKey ? ctrl.hasError(errorKey) : ctrl.invalid;
  }

  fechar(): void {
    if (this.submitting()) {
      return;
    }
    this.visible = false;
    this.visibleChange.emit(false);
  }

  confirmarBaixa(): void {
    this.form.markAllAsTouched();
    const c = this.contaSignal();
    if (!c || this.submitting()) {
      return;
    }

    const raw = this.form.getRawValue();
    const valorPago = this.roundMoney(Number(raw.valorPago));
    const saldo = this.saldoAtual();
    const metodoId = Number(raw.metodoId);
    const dataPagamento = (raw.dataPagamento ?? '').trim();

    if (valorPago > saldo) {
      this.toast.error(
        'Valor inválido',
        `O valor pago não pode exceder o saldo em aberto de R$ ${saldo.toFixed(2)}.`,
      );
      return;
    }

    if (this.form.invalid || !dataPagamento || valorPago <= 0 || !Number.isInteger(metodoId) || metodoId <= 0) {
      return;
    }

    const observacao = (raw.observacao ?? '').trim() ? (raw.observacao ?? '').trim() : null;
    this.submitting.set(true);

    let request$: Observable<BaixaPagamentoResult>;
    if (c.tipo === 'PAGAR') {
      const payload: CreateContaPagarPagamentoRequest = {
        contaPagarId: c.id,
        dataPagamento,
        valorPago,
        metodoId,
        observacao,
      };
      request$ = this.financeiroService.registrarBaixaContaPagar(payload);
    } else {
      const payload: CreateContaReceberPagamentoRequest = {
        contaReceberId: c.id,
        dataPagamento,
        valorPago,
        metodoId,
        observacao,
      };
      request$ = this.financeiroService.registrarBaixaContaReceber(payload);
    }

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (resultado) => {
        const residual = this.roundMoney(Number(resultado.saldoResidual ?? this.saldoResidual()));
        if (resultado.baixaIntegral || residual === 0) {
          this.toast.success(
            'Baixa integral registrada',
            c.tipo === 'PAGAR'
              ? `Conta a pagar liquidada com sucesso (R$ ${valorPago.toFixed(2)}).`
              : `Conta a receber liquidada com sucesso (R$ ${valorPago.toFixed(2)}).`,
          );
        } else {
          this.toast.success(
            'Baixa parcial registrada',
            `Pagamento parcial de R$ ${valorPago.toFixed(2)} registrado. Saldo residual em aberto: R$ ${residual.toFixed(2)}.`,
          );
        }
        this.baixaRegistrada.emit(resultado);
        this.visible = false;
        this.visibleChange.emit(false);
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          (c.tipo === 'PAGAR'
            ? 'Não foi possível registrar a baixa da conta a pagar.'
            : 'Não foi possível registrar a baixa da conta a receber.');
        this.toast.error('Erro ao registrar baixa', msg);
      },
    });
  }

  getTodayDateKey(referenceDate: Date = new Date()): string {
    const year = referenceDate.getFullYear();
    const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
    const day = String(referenceDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private roundMoney(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.round(value * 100) / 100;
  }
}
