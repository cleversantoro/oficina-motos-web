import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { VeiculosService } from '../../../../core/services/veiculos.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { ConfirmModalComponent } from '../../../../shared/ui/confirm-modal';
import {
  DatatableAction,
  DatatableColumn,
  DatatableComponent,
  DatatableStatusOption,
} from '../../../../shared/ui/datatable';

interface VeiculoApiItem {
  id: number;
  placa?: string | null;
  principal?: boolean;
  modeloId?: number | null;
  anoFab?: number | null;
  anoMod?: number | null;
  cor?: string | null;
  combustivel?: string | null;
  km?: number | string | null;
  ativo?: boolean;
}

interface MarcaApiItem {
  id: number;
  nome?: string;
}

interface ModeloApiItem {
  id: number;
  nome?: string;
  marcaId?: number;
}

export interface VeiculoTableRow extends Record<string, unknown> {
  id: number;
  placa: string;
  principal: boolean;
  marca: string;
  modelo: string;
  anoLabel: string;
  cor: string;
  corHex: string;
  combustivel: string;
  km: string;
  statusLabel: 'Ativo' | 'Inativo';
}

const COR_HEX_MAP: Record<string, string> = {
  Prata: '#9ca3af',
  Preto: '#374151',
  Branco: '#f3f4f6',
  Vermelho: '#ef4444',
  Azul: '#3b82f6',
  Cinza: '#6b7280',
  Verde: '#22c55e',
  Amarelo: '#eab308',
  Laranja: '#f97316',
};

@Component({
  selector: 'app-veiculo-lista',
  standalone: true,
  imports: [RouterLink, DatatableComponent, ConfirmModalComponent],
  templateUrl: './veiculo-lista.html',
  styleUrl: './veiculo-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VeiculoLista implements OnInit {
  private readonly svc = inject(VeiculosService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly confirmation = inject(Confirmation);
  private readonly toast = inject(Toast);
  private readonly destroyRef = inject(DestroyRef);

  private readonly datatable = viewChild<DatatableComponent<VeiculoTableRow>>('dt');
  private readonly placaTpl = viewChild<TemplateRef<{ $implicit: VeiculoTableRow }>>('placaTpl');
  private readonly modeloTpl = viewChild<TemplateRef<{ $implicit: VeiculoTableRow }>>('modeloTpl');
  private readonly corTpl = viewChild<TemplateRef<{ $implicit: VeiculoTableRow }>>('corTpl');

  readonly veiculos = signal<VeiculoApiItem[]>([]);
  readonly marcas = signal<MarcaApiItem[]>([]);
  readonly modelos = signal<ModeloApiItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  mostrarModal = false;
  itemParaDeletarId: number | null = null;

  readonly statusOptions: readonly DatatableStatusOption[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' },
  ];

  readonly tableRows = computed<VeiculoTableRow[]>(() => {
    const modelosList = this.modelos();
    const marcasList = this.marcas();

    return this.veiculos().map((v) => {
      const modeloObj = v.modeloId ? modelosList.find((m) => m.id === v.modeloId) : undefined;
      const marcaObj = modeloObj?.marcaId
        ? marcasList.find((mk) => mk.id === modeloObj.marcaId)
        : undefined;

      const anoLabel = v.anoFab
        ? v.anoMod && v.anoMod !== v.anoFab
          ? `${v.anoFab}/${v.anoMod}`
          : String(v.anoFab)
        : '—';

      return {
        id: v.id,
        placa: v.placa ?? '—',
        principal: Boolean(v.principal),
        marca: marcaObj?.nome ?? '—',
        modelo: modeloObj?.nome ?? '—',
        anoLabel,
        cor: v.cor ?? '—',
        corHex: COR_HEX_MAP[v.cor ?? ''] ?? '#64748b',
        combustivel: v.combustivel ?? '—',
        km: v.km !== null && v.km !== undefined && v.km !== '' ? String(v.km) : '—',
        statusLabel: v.ativo ? 'Ativo' : 'Inativo',
      };
    });
  });

  readonly columns = computed<DatatableColumn<VeiculoTableRow>[]>(() => [
    { field: 'placa', header: 'Placa', cellTemplate: this.placaTpl() },
    { field: 'marca', header: 'Marca / Modelo', subField: 'modelo', cellTemplate: this.modeloTpl() },
    { field: 'anoLabel', header: 'Ano' },
    { field: 'cor', header: 'Cor', cellTemplate: this.corTpl() },
    { field: 'combustivel', header: 'Combustível' },
    { field: 'km', header: 'KM', align: 'right' },
    { field: 'statusLabel', header: 'Status', dataType: 'badge' },
  ]);

  readonly actions: readonly DatatableAction<VeiculoTableRow>[] = [
    {
      id: 'view',
      icon: 'fa-solid fa-eye',
      label: 'Visualizar',
      variant: 'view',
      onClick: (row) => this.openDetalhe(row.id),
    },
    {
      id: 'delete',
      icon: 'fa-solid fa-trash',
      label: 'Excluir',
      variant: 'delete',
      visible: () => this.canDeleteVeiculo(),
      onClick: (row) => {
        this.abrirModal(row.id);
      },
    },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      veiculos: this.svc.list(),
      marcas: this.svc.marcas(),
      modelos: this.svc.modelos(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ veiculos, marcas, modelos }) => {
          this.veiculos.set(this.extractArray<VeiculoApiItem>(veiculos));
          this.marcas.set(this.extractArray<MarcaApiItem>(marcas));
          this.modelos.set(this.extractArray<ModeloApiItem>(modelos));
          this.loading.set(false);
        },
        error: (err: { error?: { message?: string } }) => {
          this.error.set(err?.error?.message ?? 'Erro ao carregar veículos.');
          this.loading.set(false);
        },
      });
  }

  openDetalhe(id: number): void {
    this.router.navigate(['/motos', id]);
  }

  canCreateVeiculo(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'veiculos', 'create');
  }

  canDeleteVeiculo(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'veiculos', 'delete');
  }

  abrirModal(id: number): void {
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
      const veiculo = this.veiculos().find((v) => v.id === id);
      const label = veiculo?.placa ? `Veículo ${veiculo.placa}` : `Veículo #${id}`;
      this.svc
        .delete(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.veiculos.update((list) => list.filter((v) => v.id !== id));
            this.toast.success('Veículo excluído', `"${label}" foi removido com sucesso.`);
          },
          error: () => this.toast.error('Erro ao excluir', 'Não foi possível excluir o veículo.'),
        });
    }
    this.fecharModal();
  }

  confirmDelete(id: number): void {
    this.abrirModal(id);
  }

  async confirmBulkDelete(rows: VeiculoTableRow[]): Promise<void> {
    if (!this.canDeleteVeiculo() || rows.length === 0) return;

    const confirmado = await this.confirmation.confirmDelete(`${rows.length} veículo(s) selecionado(s)`);
    if (!confirmado) return;

    const ids = rows.map((r) => r.id);
    forkJoin(ids.map((id) => this.svc.delete(id)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const idSet = new Set(ids);
          this.veiculos.update((list) => list.filter((v) => !idSet.has(v.id)));
          this.datatable()?.clearSelection();
          this.toast.success('Veículos excluídos', `${ids.length} registro(s) removido(s) com sucesso.`);
        },
        error: () => this.toast.error('Erro ao excluir', 'Não foi possível excluir os veículos selecionados.'),
      });
  }

  private extractArray<T>(resp: unknown): T[] {
    if (Array.isArray(resp)) return resp as T[];
    if (resp && typeof resp === 'object' && 'data' in resp && Array.isArray((resp as { data: unknown }).data)) {
      return (resp as { data: T[] }).data;
    }
    return [];
  }
}
