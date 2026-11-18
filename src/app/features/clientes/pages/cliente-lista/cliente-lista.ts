import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [FormsModule, ButtonModule, RouterLink, TableModule, TagModule, TooltipModule, InputTextModule],
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

  readonly clientes = signal<any[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');

  ngOnInit(): void {
    this.fetchClientes();
  }

  readonly totalAtivos = computed(() =>
    this.clientes().filter(c => c.status === 1 || c.statusDescricao === 'Ativo').length,
  );

  readonly totalVip = computed(() =>
    this.clientes().filter(c => c.vip).length,
  );

  readonly totalPJ = computed(() =>
    this.clientes().filter(c =>
      (c.tipoDescricao ?? '').toLowerCase().includes('jur'),
    ).length,
  );

  readonly filteredClientes = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const list = this.clientes();
    if (!q) return list;
    return list.filter(c =>
      (c.nome ?? '').toLowerCase().includes(q) ||
      (c.documento ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.telefone ?? '').toLowerCase().includes(q),
    );
  });

  fetchClientes(): void {
    this.loading.set(true);
    this.clientesService
      .listTable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const items = Array.isArray(resp) ? resp : (resp?.items ?? resp?.data ?? []);
          this.clientes.set(items);
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
      '#f97316', '#3b82f6', '#8b5cf6', '#10b981',
      '#f59e0b', '#ec4899', '#06b6d4', '#84cc16',
    ];
    let hash = 0;
    for (const ch of (name ?? '')) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getStatusClass(status: string): string {
    switch ((status ?? '').toLowerCase()) {
      case 'ativo':    return 'status-ativo';
      case 'inativo':  return 'status-inativo';
      case 'suspenso': return 'status-suspenso';
      case 'bloqueado':return 'status-bloqueado';
      default:         return 'status-inativo';
    }
  }

  getTipoClass(tipo: string): string {
    return (tipo ?? '').toLowerCase().includes('jur') ? 'tipo-pj' : 'tipo-pf';
  }

  navigateTo(id: number): void {
    this.router.navigate(['/clientes', id]);
  }

  editarCliente(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.router.navigate(['/clientes', id, 'editar']);
  }

  canEditCliente(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'clientes', 'edit');
  }

  canDeleteCliente(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'clientes', 'delete');
  }

  async confirmDelete(event: MouseEvent, id: number): Promise<void> {
    event.stopPropagation();
    const cliente = this.clientes().find(c => c.id === id);
    const confirmado = await this.confirmation.confirmDelete(cliente?.nome || 'este cliente');
    if (confirmado) {
      this.clientesService.delete(id).subscribe({
        next: () => {
          this.clientes.update(list => list.filter(c => c.id !== id));
          this.toast.success('Sucesso', 'Cliente excluído com sucesso');
        },
        error: () => this.toast.error('Erro', 'Erro ao excluir cliente'),
      });
    }
  }
}
