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
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import {
  ClienteTipo,
  getClienteTipoLabel,
  isClientePessoaJuridica,
} from '../../../../core/models/cliente';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import {
  DatatableAction,
  DatatableColumn,
  DatatableComponent,
  DatatableStatusOption,
} from '../../../../shared/ui/datatable';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [RouterLink, DatatableComponent],
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteLista implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly toast = inject(Toast);
  private readonly confirmation = inject(Confirmation);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly nomeTpl = viewChild<TemplateRef<{ $implicit: any }>>('nomeTpl');
  private readonly tipoTpl = viewChild<TemplateRef<{ $implicit: any }>>('tipoTpl');
  private readonly vipTpl = viewChild<TemplateRef<{ $implicit: any }>>('vipTpl');

  readonly clientes = signal<any[]>([]);
  readonly loading = signal(false);

  readonly statusOptions: readonly DatatableStatusOption[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' },
    { label: 'Suspenso', value: 'Suspenso' },
    { label: 'Bloqueado', value: 'Bloqueado' },
  ];

  readonly columns = computed<DatatableColumn<any>[]>(() => [
    { field: 'nome', header: 'Cliente', subField: 'nomeExibicao', cellTemplate: this.nomeTpl() },
    { field: 'documento', header: 'CPF / CNPJ' },
    { field: 'email', header: 'E-mail' },
    { field: 'telefone', header: 'Telefone', sortable: false },
    { field: 'tipoDescricao', header: 'Tipo', cellTemplate: this.tipoTpl() },
    { field: 'vip', header: 'VIP', align: 'center', sortable: false, cellTemplate: this.vipTpl() },
    { field: 'statusDescricao', header: 'Status', dataType: 'badge' },
  ]);

  readonly actions: readonly DatatableAction<any>[] = [
    {
      id: 'view',
      icon: 'fa-solid fa-eye',
      label: 'Ver detalhes',
      variant: 'view',
      onClick: (c) => this.navigateTo(c.id),
    },
    {
      id: 'edit',
      icon: 'fa-solid fa-pencil',
      label: 'Editar',
      variant: 'edit',
      visible: () => this.canEditCliente(),
      onClick: (c) => {
        void this.router.navigate(['/clientes', c.id, 'editar']);
      },
    },
    {
      id: 'delete',
      icon: 'fa-solid fa-trash',
      label: 'Excluir',
      variant: 'delete',
      visible: () => this.canDeleteCliente(),
      onClick: (c) => {
        void this.confirmDelete(c.id);
      },
    },
  ];

  ngOnInit(): void {
    this.fetchClientes();
  }

  readonly totalAtivos = computed(
    () => this.clientes().filter((c) => c.status === 1 || c.statusDescricao === 'Ativo').length,
  );

  readonly totalVip = computed(() => this.clientes().filter((c) => c.vip).length);

  readonly totalPJ = computed(
    () =>
      this.clientes().filter(
        (c) =>
          isClientePessoaJuridica(c.tipo) ||
          (c.tipoDescricao ?? '').toLowerCase().includes('jur'),
      ).length,
  );

  fetchClientes(): void {
    this.loading.set(true);
    this.clientesService
      .listTable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const items = Array.isArray(resp) ? resp : (resp?.items ?? resp?.data ?? []);
          this.clientes.set(
            items.map((item: any) => ({
              ...item,
              tipo: Number(item.tipo) === ClienteTipo.PessoaJuridica
                ? ClienteTipo.PessoaJuridica
                : ClienteTipo.PessoaFisica,
              tipoDescricao: getClienteTipoLabel(item.tipo, item.tipoDescricao),
              statusDescricao: item.statusDescricao || 'Ativo',
            })),
          );
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#f97316',
      '#3b82f6',
      '#8b5cf6',
      '#10b981',
      '#f59e0b',
      '#ec4899',
      '#06b6d4',
      '#84cc16',
    ];
    let hash = 0;
    for (const ch of name ?? '') hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getTipoClass(tipo?: number | string, tipoDescricao?: string): string {
    if (isClientePessoaJuridica(tipo)) return 'tipo-pj';
    if (Number(tipo) === ClienteTipo.PessoaFisica) return 'tipo-pf';
    return (tipoDescricao ?? String(tipo ?? '')).toLowerCase().includes('jur')
      ? 'tipo-pj'
      : 'tipo-pf';
  }

  navigateTo(id: number): void {
    void this.router.navigate(['/clientes', id]);
  }

  canEditCliente(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'clientes', 'edit');
  }

  canDeleteCliente(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'clientes', 'delete');
  }

  async confirmDelete(id: number): Promise<void> {
    const cliente = this.clientes().find((c) => c.id === id);
    const confirmado = await this.confirmation.confirmDelete(cliente?.nome || 'este cliente');
    if (confirmado) {
      this.clientesService.delete(id).subscribe({
        next: () => {
          this.clientes.update((list) => list.filter((c) => c.id !== id));
          this.toast.success('Sucesso', 'Cliente excluído com sucesso');
        },
        error: () => this.toast.error('Erro', 'Erro ao excluir cliente'),
      });
    }
  }
}
