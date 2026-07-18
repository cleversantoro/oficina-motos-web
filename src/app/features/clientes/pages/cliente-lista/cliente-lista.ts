import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RouterLink, TableModule, TagModule, TooltipModule, InputTextModule],
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss',
  providers: [ClientesService],
})
export class ClienteLista implements OnInit {
  private toast = inject(Toast);
  private confirmation = inject(Confirmation);
  private router = inject(Router);

  clientes: any[] = [];
  loading = false;
  searchTerm = '';

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.fetchClientes();
  }

  get totalAtivos(): number {
    return this.clientes.filter(c => (c.status === 1 || c.statusDescricao === 'Ativo')).length;
  }

  get totalVip(): number {
    return this.clientes.filter(c => c.vip).length;
  }

  get totalPJ(): number {
    return this.clientes.filter(c =>
      (c.tipoDescricao ?? '').toLowerCase().includes('jur')
    ).length;
  }

  fetchClientes(): void {
    this.loading = true;
    this.clientesService.listTable().subscribe({
      next: (resp: any) => {
        this.clientes = Array.isArray(resp) ? resp : (resp?.items ?? resp?.data ?? []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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

  async confirmDelete(event: MouseEvent, id: number): Promise<void> {
    event.stopPropagation();
    const cliente = this.clientes.find(c => c.id === id);
    const confirmado = await this.confirmation.confirmDelete(cliente?.nome || 'este cliente');
    if (confirmado) {
      this.clientesService.delete(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter(c => c.id !== id);
          this.toast.success('Sucesso', 'Cliente excluído com sucesso');
        },
        error: () => this.toast.error('Erro', 'Erro ao excluir cliente'),
      });
    }
  }
}
