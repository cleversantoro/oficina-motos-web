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
import { TagModule } from 'primeng/tag';
import {
  CreateOrdemServicoItemRequest,
  EstoquePeca,
  OrdemServicoItem,
} from '../../../../core/models';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { OrdensService } from '../../../../core/services/ordens.service';
import { Toast } from '../../../../shared/services/toast';

@Component({
  selector: 'app-os-item-peca-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DialogModule, ButtonModule, TagModule],
  templateUrl: './os-item-peca-modal.html',
  styleUrl: './os-item-peca-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsItemPecaModalComponent {
  private readonly ordensService = inject(OrdensService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly toast = inject(Toast);

  @Input() visible = false;
  @Input({ required: true }) ordemServicoId!: number;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() itemAdded = new EventEmitter<OrdemServicoItem>();

  readonly termoBusca = signal('');
  readonly pecasSugeridas = signal<EstoquePeca[]>([]);
  readonly buscandoPecas = signal(false);
  readonly pecaSelecionada = signal<EstoquePeca | null>(null);
  readonly descricao = signal('');
  readonly quantidade = signal(1);
  readonly valorUnitario = signal(0);
  readonly submitting = signal(false);

  readonly subtotal = computed(() => {
    const qtd = Number(this.quantidade()) || 0;
    const valor = Number(this.valorUnitario()) || 0;
    return qtd * valor;
  });

  readonly isValido = computed(() => {
    return (
      !!this.pecaSelecionada() &&
      this.descricao().trim().length > 0 &&
      this.quantidade() >= 1 &&
      this.valorUnitario() >= 0
    );
  });

  buscarPecas(termo: string): void {
    this.termoBusca.set(termo);
    const buscaLimpa = termo.trim().toLowerCase();

    if (buscaLimpa.length < 2) {
      this.pecasSugeridas.set([]);
      return;
    }

    this.buscandoPecas.set(true);
    this.estoqueService.pecas().subscribe({
      next: (res: any) => {
        this.buscandoPecas.set(false);
        const lista: EstoquePeca[] = Array.isArray(res) ? res : res?.items || [];
        const filtradas = lista.filter(p => {
          const cod = (p.codigo || '').toLowerCase();
          const desc = (p.descricao || '').toLowerCase();
          return cod.includes(buscaLimpa) || desc.includes(buscaLimpa);
        });
        this.pecasSugeridas.set(filtradas.slice(0, 8));
      },
      error: () => {
        this.buscandoPecas.set(false);
        this.pecasSugeridas.set([]);
      },
    });
  }

  selecionarPeca(peca: EstoquePeca): void {
    this.pecaSelecionada.set(peca);
    this.descricao.set(`${peca.codigo} - ${peca.descricao}`);
    this.valorUnitario.set(Number(peca.precoUnitario) || 0);
    this.pecasSugeridas.set([]);
    this.termoBusca.set(`${peca.codigo} - ${peca.descricao}`);
  }

  limparPeca(): void {
    this.pecaSelecionada.set(null);
    this.termoBusca.set('');
    this.descricao.set('');
    this.valorUnitario.set(0);
    this.quantidade.set(1);
    this.pecasSugeridas.set([]);
  }

  salvar(): void {
    if (!this.isValido() || this.submitting()) return;

    const peca = this.pecaSelecionada();
    if (!peca) {
      this.toast.error('Erro de validação', 'Selecione uma peça do estoque.');
      return;
    }

    if (this.quantidade() < 1) {
      this.toast.error('Erro de validação', 'A quantidade mínima deve ser 1.');
      return;
    }

    this.submitting.set(true);

    const payload: CreateOrdemServicoItemRequest = {
      ordemServicoId: this.ordemServicoId,
      pecaId: peca.id,
      descricao: this.descricao().trim(),
      quantidade: Math.floor(this.quantidade()),
      valorUnitario: this.valorUnitario(),
    };

    this.ordensService.addItem<OrdemServicoItem, CreateOrdemServicoItemRequest>(payload).subscribe({
      next: (itemCriado: OrdemServicoItem) => {
        this.submitting.set(false);
        this.toast.success('Peça adicionada', `"${itemCriado.descricao}" incluída com sucesso na OS.`);
        this.itemAdded.emit(itemCriado);
        this.fechar();
      },
      error: () => {
        this.submitting.set(false);
        this.toast.error('Erro ao adicionar peça', 'Não foi possível salvar o item na ordem de serviço.');
      },
    });
  }

  fechar(): void {
    this.limparPeca();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
