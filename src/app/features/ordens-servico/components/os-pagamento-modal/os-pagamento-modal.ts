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
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import {
  CreateOrdemServicoPagamentoRequest,
  OrdemServicoPagamento,
} from '../../../../core/models';
import { OrdensService } from '../../../../core/services/ordens.service';
import { Toast } from '../../../../shared/services/toast';

export interface MetodoPagamentoOpcao {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-os-pagamento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DialogModule, ButtonModule, TagModule],
  templateUrl: './os-pagamento-modal.html',
  styleUrl: './os-pagamento-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsPagamentoModalComponent implements OnChanges {
  private readonly ordensService = inject(OrdensService);
  private readonly toast = inject(Toast);

  @Input() visible = false;
  @Input({ required: true }) ordemServicoId!: number;
  @Input() saldoPendente = 0;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() pagamentoRegistrado = new EventEmitter<OrdemServicoPagamento>();

  readonly valor = signal<number>(0);
  readonly metodo = signal<string>('PIX');
  readonly dataPagamento = signal<string>(new Date().toISOString().substring(0, 10));
  readonly observacao = signal<string>('');
  readonly submitting = signal<boolean>(false);

  readonly metodosHomologados: MetodoPagamentoOpcao[] = [
    { label: 'PIX', value: 'PIX', icon: 'pi pi-bolt' },
    { label: 'Cartão de Crédito', value: 'CartaoCredito', icon: 'pi pi-credit-card' },
    { label: 'Cartão de Débito', value: 'CartaoDebito', icon: 'pi pi-credit-card' },
    { label: 'Dinheiro', value: 'Dinheiro', icon: 'pi pi-money-bill' },
    { label: 'Transferência Bancária', value: 'Transferencia', icon: 'pi pi-arrow-right-arrow-left' },
  ];

  readonly isIntegral = computed(() => {
    const val = Number(this.valor()) || 0;
    const saldo = Number(this.saldoPendente) || 0;
    return val >= saldo && saldo > 0;
  });

  readonly valorExcedente = computed(() => {
    const val = Number(this.valor()) || 0;
    const saldo = Number(this.saldoPendente) || 0;
    return val > saldo;
  });

  readonly formularioValido = computed(() => {
    const val = Number(this.valor()) || 0;
    const saldo = Number(this.saldoPendente) || 0;
    return val > 0 && val <= saldo && !!this.metodo() && !!this.dataPagamento();
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.resetForm();
    }
  }

  preencherTotal(): void {
    this.valor.set(this.saldoPendente);
  }

  onValorInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const val = parseFloat(target.value);
    this.valor.set(isNaN(val) ? 0 : val);
  }

  salvar(): void {
    if (!this.formularioValido() || this.submitting()) return;

    const val = this.valor();
    if (val <= 0) {
      this.toast.error('Erro de validação', 'O valor informado deve ser maior que zero.');
      return;
    }

    if (val > this.saldoPendente) {
      this.toast.error('Erro de validação', 'O valor não pode exceder o saldo pendente da OS.');
      return;
    }

    this.submitting.set(true);

    const payload: CreateOrdemServicoPagamentoRequest = {
      ordemServicoId: this.ordemServicoId,
      valor: val,
      metodo: this.metodo(),
      status: 'Liquidado',
      dataPagamento: this.dataPagamento() ? new Date(this.dataPagamento()).toISOString() : new Date().toISOString(),
      observacao: this.observacao().trim() || null,
    };

    this.ordensService.addPagamento(payload).subscribe({
      next: (pagamentoCriado: OrdemServicoPagamento) => {
        this.submitting.set(false);
        const integralMsg = this.isIntegral() ? ' Ordem de Serviço concluída com sucesso!' : '';
        this.toast.success(
          'Pagamento registrado',
          `Pagamento de R$ ${val.toFixed(2)} registrado.${integralMsg}`
        );
        this.pagamentoRegistrado.emit(pagamentoCriado);
        this.fechar();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || 'Não foi possível registrar o pagamento da ordem de serviço.';
        this.toast.error('Erro ao registrar pagamento', msg);
      },
    });
  }

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private resetForm(): void {
    this.valor.set(this.saldoPendente > 0 ? this.saldoPendente : 0);
    this.metodo.set('PIX');
    this.dataPagamento.set(new Date().toISOString().substring(0, 10));
    this.observacao.set('');
    this.submitting.set(false);
  }
}

