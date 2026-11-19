import { ChangeDetectionStrategy, Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction, canPerformPermission } from '../../../../core/auth/rbac-access.helper';
import { OrdemServico } from '../../../../core/models';
import { OrdensService } from '../../../../core/services/ordens.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { ConfirmModalComponent } from '../../../../shared/ui/confirm-modal';
import {
  DatatableAction,
  DatatableColumn,
  DatatableComponent,
  DatatableStatusOption,
} from '../../../../shared/ui/datatable';
import { SIMPLE_BUTTON_IMPORTS } from '../../../../shared/ui/simple-primitives';

type OrdemRow = OrdemServico & Record<string, unknown>;

@Component({
  selector: 'app-os-lista',
  standalone: true,
  imports: [...SIMPLE_BUTTON_IMPORTS, DatatableComponent, ConfirmModalComponent],
  templateUrl: './os-lista.html',
  styleUrl: './os-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsListaComponent implements OnInit {
  @ViewChild('dt') private dt?: DatatableComponent<OrdemRow>;

  readonly ordens = signal<OrdemServico[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  mostrarModal = false;
  itemParaDeletarId: number | null = null;

  readonly tableRows = computed<OrdemRow[]>(() =>
    this.ordens().map((ordem) => ({ ...ordem })),
  );

  readonly statusOptions: readonly DatatableStatusOption[] = [
    { label: 'Aberta', value: 'Aberta' },
    { label: 'Em Andamento', value: 'EmAndamento' },
    { label: 'Aguardando Peça', value: 'AguardandoPeca' },
    { label: 'Concluída', value: 'Concluida' },
    { label: 'Cancelada', value: 'Cancelada' },
  ];

  readonly columns: readonly DatatableColumn<OrdemRow>[] = [
    { field: 'id', header: 'ID', dataType: 'number', width: '90px', sortable: true },
    { field: 'status', header: 'Status', dataType: 'badge', sortable: true },
    { field: 'dataAbertura', header: 'Abertura', dataType: 'date', sortable: true },
    { field: 'clienteNome', header: 'Cliente', sortable: true },
    { field: 'mecanicoNome', header: 'Mecânico', sortable: true },
    { field: 'veiculoModeloNome', header: 'Veículo', sortable: true },
    { field: 'veiculoPlaca', header: 'Placa', sortable: true },
    { field: 'descricaoProblema', header: 'Descrição', width:'50px', sortable: false },
  ];

  readonly actions: readonly DatatableAction<OrdemRow>[] = [
    {
      id: 'view',
      icon: 'fa-solid fa-eye',
      label: 'Detalhes',
      variant: 'view',
      onClick: (ordem) => this.openDetails(ordem),
      disabled: (ordem) => !Number.isInteger(ordem.id) || ordem.id <= 0,
    },
    {
      id: 'delete',
      icon: 'fa-solid fa-trash',
      label: 'Excluir',
      variant: 'delete',
      onClick: (ordem) => {
        this.abrirModal(ordem.id);
      },
      visible: () => this.canDeleteOrdem(),
    },
  ];

  constructor(
    private readonly ordensService: OrdensService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toast: Toast,
    private readonly confirmation: Confirmation,
  ) {}

  ngOnInit(): void {
    this.fetchOrdens();
  }

  fetchOrdens(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ordensService.list<OrdemServico[]>().subscribe({
      next: (response) => {
        this.ordens.set(response ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as ordens de serviço.');
        this.loading.set(false);
      },
    });
  }

  canCreateOrdem(): boolean {
    return canPerformPermission(
      this.authService.permissions(),
      'ordens',
      'criar',
      this.authService.currentRole(),
    );
  }

  canDeleteOrdem(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'ordens', 'delete');
  }

  openNew(): void {
    if (!this.canCreateOrdem()) {
      this.toast.warn('Acesso negado', 'Você não tem permissão para acessar esta área.');
      return;
    }
    void this.router.navigate(['/ordens/novo']);
  }

  openDetails(ordem: OrdemServico): void {
    if (!Number.isInteger(ordem.id) || ordem.id <= 0) return;
    void this.router.navigate(['/ordens', ordem.id]);
  }

  abrirModal(id: number): void {
    if (!Number.isInteger(id) || id <= 0) return;
    this.itemParaDeletarId = id;
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.itemParaDeletarId = null;
  }

  executarExclusao(): void {
    if (this.itemParaDeletarId !== null) {
      const id = this.itemParaDeletarId;
      this.ordensService.delete(id).subscribe({
        next: () => {
          this.ordens.update((ordens) => ordens.filter((ordem) => ordem.id !== id));
          this.toast.success('Ordem excluída', `OS #${id} removida com sucesso.`);
        },
        error: () => this.toast.error('Erro', 'Não foi possível excluir a ordem de serviço.'),
      });
    }
    this.fecharModal();
  }

  confirmDelete(id: number): void {
    this.abrirModal(id);
  }

  async confirmBulkDelete(rows: OrdemRow[]): Promise<void> {
    if (!this.canDeleteOrdem() || rows.length === 0) return;
    const confirmado = await this.confirmation.confirmDelete(`${rows.length} ordem(ns) de serviço`);
    if (!confirmado) return;

    const ids = rows.map((r) => r.id).filter((id) => Number.isInteger(id) && id > 0);
    if (ids.length === 0) return;

    forkJoin(ids.map((id) => this.ordensService.delete(id))).subscribe({
      next: () => {
        const idSet = new Set(ids);
        this.ordens.update((ordens) => ordens.filter((ordem) => !idSet.has(ordem.id)));
        this.dt?.clearSelection();
        this.toast.success('Ordens excluídas', `${ids.length} ordem(ns) removida(s) com sucesso.`);
      },
      error: () => this.toast.error('Erro', 'Não foi possível excluir as ordens selecionadas.'),
    });
  }
}
