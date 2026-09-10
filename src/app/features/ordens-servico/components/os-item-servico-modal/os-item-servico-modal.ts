import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import {
  CreateOrdemServicoItemRequest,
  OrdemServicoItem,
} from '../../../../core/models';
import { OrdensService } from '../../../../core/services/ordens.service';
import { Toast } from '../../../../shared/services/toast';

@Component({
  selector: 'app-os-item-servico-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DialogModule, ButtonModule],
  templateUrl: './os-item-servico-modal.html',
  styleUrl: './os-item-servico-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsItemServicoModalComponent {
  private readonly ordensService = inject(OrdensService);
  private readonly toast = inject(Toast);

  @Input() visible = false;
  @Input({ required: true }) ordemServicoId!: number;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() itemAdded = new EventEmitter<OrdemServicoItem>();

  readonly descricao = signal('');
  readonly quantidade = signal(1);
  readonly valorUnitario = signal(0);
  readonly submitting = signal(false);

  readonly subtotal = computed(() => {
    const qtd = Number(this.quantidade()) || 0;
    const valor = Number(this.valorUnitario()) || 0;
    return qtd * valor;
  });

  readonly caracteresRestantes = computed(() => {
    return 240 - this.descricao().length;
  });

  readonly isValido = computed(() => {
    const desc = this.descricao().trim();
    return desc.length > 0 && desc.length <= 240 && this.quantidade() >= 1 && this.valorUnitario() >= 0;
  });

  salvar(): void {
    if (!this.isValido() || this.submitting()) return;

    if (!this.descricao().trim()) {
      this.toast.error('Erro de validação', 'Informe a descrição do serviço.');
      return;
    }

    if (this.quantidade() < 1) {
      this.toast.error('Erro de validação', 'A quantidade mínima deve ser 1.');
      return;
    }

    this.submitting.set(true);

    const payload: CreateOrdemServicoItemRequest = {
      ordemServicoId: this.ordemServicoId,
      pecaId: null,
      descricao: this.descricao().trim(),
      quantidade: Math.floor(this.quantidade()),
      valorUnitario: this.valorUnitario(),
    };

    this.ordensService.addItem<OrdemServicoItem, CreateOrdemServicoItemRequest>(payload).subscribe({
      next: (itemCriado: OrdemServicoItem) => {
        this.submitting.set(false);
        this.toast.success('Serviço adicionado', `"${itemCriado.descricao}" incluído com sucesso na OS.`);
        this.itemAdded.emit(itemCriado);
        this.fechar();
      },
      error: () => {
        this.submitting.set(false);
        this.toast.error('Erro ao adicionar serviço', 'Não foi possível salvar o serviço na ordem de serviço.');
      },
    });
  }

  fechar(): void {
    this.descricao.set('');
    this.quantidade.set(1);
    this.valorUnitario.set(0);
    this.submitting.set(false);
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
