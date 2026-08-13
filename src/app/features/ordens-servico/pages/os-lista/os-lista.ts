import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction, canPerformPermission } from '../../../../core/auth/rbac-access.helper';
import { OrdensService } from '../../../../core/services/ordens.service';
import { OrdemServico } from '../../../../core/models';
import { Toast } from '../../../../shared/services/toast';
import { DataTable, TableAction, TableColumn } from '../../../../shared/ui/data-table';

@Component({
  selector: 'app-os-lista',
  standalone: true,
  imports: [ButtonModule, DataTable],
  templateUrl: './os-lista.html',
  styleUrl: './os-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsListaComponent implements OnInit {
  readonly ordens = signal<OrdemServico[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly columns: TableColumn<OrdemServico>[] = [
    { field: 'id', header: 'ID', dataType: 'number', width: '90px', sortable: true, filterable: true, filterType: 'numeric' },
    { field: 'status', header: 'Status', sortable: true, filterable: true, filterType: 'text' },
    { field: 'dataAbertura', header: 'Abertura', dataType: 'date', sortable: true },
    { field: 'clienteId', header: 'Cliente', dataType: 'number', sortable: true, filterable: true, filterType: 'numeric' },
    { field: 'mecanicoId', header: 'Mecânico', dataType: 'number', sortable: true, filterable: true, filterType: 'numeric' },
    { field: 'descricaoProblema', header: 'Descrição', sortable: false },
  ];

  readonly actions: TableAction<OrdemServico>[] = [
    {
      icon: 'pi pi-eye',
      tooltip: 'Visualizar ordem',
      styleClass: 'p-button-rounded p-button-text p-button-info',
      onClick: ordem => this.openDetails(ordem),
      disabled: ordem => !Number.isInteger(ordem.id) || ordem.id <= 0,
    },
    {
      icon: 'pi pi-trash',
      tooltip: 'Excluir ordem',
      styleClass: 'p-button-rounded p-button-text p-button-danger',
      onClick: ordem => this.confirmDelete(ordem.id),
      visible: () => this.canDeleteOrdem(),
    },
  ];

  constructor(
    private readonly ordensService: OrdensService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toast: Toast,
  ) {}

  ngOnInit(): void {
    this.fetchOrdens();
  }

  fetchOrdens(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ordensService.list<OrdemServico[]>().subscribe({
      next: response => {
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
    return canPerformPermission(this.authService.permissions(), 'ordens', 'criar', this.authService.currentRole());
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

  confirmDelete(id: number): void {
    if (!Number.isInteger(id) || id <= 0 || !confirm('Tem certeza que deseja excluir esta OS?')) return;
    this.ordensService.delete(id).subscribe({
      next: () => {
        this.ordens.update(ordens => ordens.filter(ordem => ordem.id !== id));
      },
      error: () => this.toast.error('Erro', 'Não foi possível excluir a ordem de serviço.'),
    });
  }
}
