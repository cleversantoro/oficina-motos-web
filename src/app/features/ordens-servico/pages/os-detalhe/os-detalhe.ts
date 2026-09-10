import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import {
  Cliente,
  OrdemServico,
  OrdemServicoItem,
  OS_STATUS_LABELS,
  OS_STATUS_SEVERITIES,
  OS_STATUS_TRANSITIONS,
  UpdateOrdemServicoRequest,
  Veiculo,
} from '../../../../core/models';
import { ClientesService } from '../../../../core/services/clientes.service';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { OrdensService } from '../../../../core/services/ordens.service';
import { VeiculosService } from '../../../../core/services/veiculos.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { OsItemPecaModalComponent } from '../../components/os-item-peca-modal/os-item-peca-modal';
import { OsItemServicoModalComponent } from '../../components/os-item-servico-modal/os-item-servico-modal';

@Component({
  selector: 'app-os-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    ButtonModule,
    TagModule,
    FormsModule,
    OsItemPecaModalComponent,
    OsItemServicoModalComponent,
  ],
  templateUrl: './os-detalhe.html',
  styleUrl: './os-detalhe.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsDetalheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordensService = inject(OrdensService);
  private readonly clientesService = inject(ClientesService);
  private readonly veiculosService = inject(VeiculosService);
  private readonly mecanicosService = inject(MecanicosService);
  private readonly toast = inject(Toast);
  private readonly confirmation = inject(Confirmation);

  readonly ordem = signal<OrdemServico | null>(null);
  readonly cliente = signal<Cliente | null>(null);
  readonly veiculo = signal<Veiculo | null>(null);
  readonly mecanicoNome = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submittingStatus = signal(false);
  readonly statusSelecionado = signal<string>('');
  readonly modalPecaAberto = signal(false);
  readonly modalServicoAberto = signal(false);
  readonly deletingItemId = signal<number | null>(null);

  readonly transicoesValidas = computed(() => {
    const status = this.ordem()?.status;
    if (!status) return [];
    return OS_STATUS_TRANSITIONS[status] || [];
  });

  readonly statusLabel = computed(() => {
    const status = this.ordem()?.status;
    if (!status) return '';
    return OS_STATUS_LABELS[status] || status;
  });

  readonly statusSeverity = computed(() => {
    const status = this.ordem()?.status;
    if (!status) return 'info';
    return OS_STATUS_SEVERITIES[status] || 'info';
  });

  readonly isTerminal = computed(() => {
    const status = this.ordem()?.status;
    return status === 'Concluida' || status === 'Cancelada';
  });

  readonly totalItens = computed(() => {
    const itens = this.ordem()?.itens;
    if (!itens || itens.length === 0) return 0;
    return itens.reduce((acc, item) => {
      const itemTotal = Number(item.total) || (Number(item.quantidade) * Number(item.valorUnitario)) || 0;
      return acc + itemTotal;
    }, 0);
  });

  readonly totalPago = computed(() => {
    const pagamentos = this.ordem()?.pagamentos;
    if (!pagamentos || pagamentos.length === 0) return 0;
    return pagamentos.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
  });

  readonly saldoPendente = computed(() => {
    return Math.max(0, this.totalItens() - this.totalPago());
  });

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    const id = Number(param);
    if (!param || !Number.isInteger(id) || id <= 0) {
      this.error.set('Identificador de ordem inválido.');
      return;
    }

    this.carregarOrdem(id);
  }

  carregarOrdem(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordensService.get(id).subscribe({
      next: response => {
        const ordem = response as OrdemServico;
        this.ordem.set(ordem);
        this.loading.set(false);

        if (ordem.clienteId) {
          this.carregarCliente(ordem.clienteId);
        }
        if (ordem.veiculoId) {
          this.carregarVeiculo(ordem.veiculoId);
        }
        if (ordem.mecanicoId) {
          this.carregarMecanico(ordem.mecanicoId);
        }
      },
      error: () => {
        this.error.set('Ordem de serviço não encontrada ou indisponível.');
        this.loading.set(false);
      },
    });
  }

  private carregarCliente(clienteId: number): void {
    this.clientesService.get(clienteId).subscribe({
      next: res => this.cliente.set(res as Cliente),
      error: () => this.cliente.set(null),
    });
  }

  private carregarVeiculo(veiculoId: number): void {
    this.veiculosService.get(veiculoId).subscribe({
      next: res => this.veiculo.set(res as Veiculo),
      error: () => this.veiculo.set(null),
    });
  }

  private carregarMecanico(mecanicoId: number): void {
    this.mecanicosService.get(mecanicoId).subscribe({
      next: (res: any) => {
        if (res) {
          const nome = [res.nome, res.sobrenome].filter(Boolean).join(' ');
          this.mecanicoNome.set(nome || `Mecânico #${mecanicoId}`);
        }
      },
      error: () => this.mecanicoNome.set(`Mecânico #${mecanicoId}`),
    });
  }

  alterarStatus(novoStatus?: string): void {
    const statusDestino = novoStatus || this.statusSelecionado();
    if (!statusDestino || this.submittingStatus()) return;

    const ordemAtual = this.ordem();
    if (!ordemAtual || statusDestino === ordemAtual.status) return;

    if (!this.transicoesValidas().includes(statusDestino)) {
      this.toast.error('Transição inválida', `A transição de ${ordemAtual.status} para ${statusDestino} não é permitida.`);
      return;
    }

    this.submittingStatus.set(true);
    const payload: UpdateOrdemServicoRequest = {
      clienteId: ordemAtual.clienteId,
      mecanicoId: ordemAtual.mecanicoId,
      veiculoId: ordemAtual.veiculoId,
      descricaoProblema: ordemAtual.descricaoProblema,
      status: statusDestino,
      dataAbertura: ordemAtual.dataAbertura || null,
      dataConclusao: statusDestino === 'Concluida' ? (ordemAtual.dataConclusao || new Date().toISOString()) : ordemAtual.dataConclusao,
    };

    this.ordensService.update(ordemAtual.id, payload).subscribe({
      next: () => {
        this.ordem.set({
          ...ordemAtual,
          status: statusDestino,
          dataConclusao: payload.dataConclusao,
        });
        this.statusSelecionado.set('');
        this.submittingStatus.set(false);
        this.toast.success(
          'Status atualizado',
          `Status da OS #${ordemAtual.id} alterado para "${OS_STATUS_LABELS[statusDestino] || statusDestino}" com sucesso.`,
        );
      },
      error: () => {
        this.submittingStatus.set(false);
        this.toast.error('Erro', 'Não foi possível atualizar o status da ordem de serviço.');
      },
    });
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const valor = target.value;
    if (!valor) return;
    this.statusSelecionado.set(valor);
  }

  getStatusLabel(status: string): string {
    return OS_STATUS_LABELS[status] || status;
  }

  getStatusSeverity(status: string): 'info' | 'warn' | 'success' | 'danger' | 'secondary' {
    return OS_STATUS_SEVERITIES[status] || 'info';
  }

  abrirModalPeca(): void {
    if (!this.isTerminal()) {
      this.modalPecaAberto.set(true);
    }
  }

  abrirModalServico(): void {
    if (!this.isTerminal()) {
      this.modalServicoAberto.set(true);
    }
  }

  onItemAdicionado(novoItem: OrdemServicoItem): void {
    this.ordem.update(atual => {
      if (!atual) return null;
      return {
        ...atual,
        itens: [...(atual.itens || []), novoItem],
      };
    });
  }

  async confirmarExclusaoItem(item: OrdemServicoItem): Promise<void> {
    if (this.isTerminal() || this.deletingItemId() !== null) return;

    const confirmado = await this.confirmation.confirmDelete(item.descricao);
    if (!confirmado) return;

    this.deletingItemId.set(item.id);
    this.ordensService.deleteItem(item.id).subscribe({
      next: () => {
        this.ordem.update(atual => {
          if (!atual) return null;
          return {
            ...atual,
            itens: (atual.itens || []).filter(i => i.id !== item.id),
          };
        });
        this.deletingItemId.set(null);
        this.toast.success('Item excluído', `"${item.descricao}" removido da ordem de serviço.`);
      },
      error: () => {
        this.deletingItemId.set(null);
        this.toast.error('Erro ao excluir', 'Não foi possível remover o item da ordem de serviço.');
      },
    });
  }
}

