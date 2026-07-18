import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Toast } from '../../../../shared/services/toast';
import { Confirmation } from '../../../../shared/services/confirmation';

@Component({
  selector: 'app-cliente-detalhe',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TabsModule, TagModule, RouterLink],
  templateUrl: './cliente-detalhe.html',
  styleUrl: './cliente-detalhe.scss',
  providers: [ClientesService],
})
export class ClienteDetalhe implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientesService = inject(ClientesService);
  private toast = inject(Toast);
  private confirmation = inject(Confirmation);

  cliente: any = null;
  loading = true;
  error: string | null = null;
  clienteId = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/clientes']);
      return;
    }
    this.clienteId = +id;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.clientesService.get(this.clienteId).subscribe({
      next: (resp: any) => {
        this.cliente = resp;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar os dados do cliente.';
        this.loading = false;
      },
    });
  }

  editarCliente(): void {
    this.router.navigate(['/clientes', this.clienteId, 'editar']);
  }

  async excluirCliente(): Promise<void> {
    const confirmado = await this.confirmation.confirmDelete(this.cliente?.nome || 'este cliente');
    if (!confirmado) return;
    this.clientesService.delete(this.clienteId).subscribe({
      next: () => {
        this.toast.success('Sucesso', 'Cliente excluído com sucesso');
        this.router.navigate(['/clientes']);
      },
      error: () => {
        this.toast.error('Erro', 'Erro ao excluir cliente');
      },
    });
  }

  getInitials(nome: string): string {
    if (!nome) return '?';
    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getStatusSeverity(status: number): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 1: return 'success';
      case 2: return 'warn';
      case 3: return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: number, desc?: string): string {
    if (desc) return desc;
    switch (status) {
      case 0: return 'Inativo';
      case 1: return 'Ativo';
      case 2: return 'Suspenso';
      case 3: return 'Bloqueado';
      default: return 'Desconhecido';
    }
  }

  objEntries(obj: any): [string, any][] {
    if (!obj) return [];
    return Object.entries(obj).filter(([k]) => k !== 'id' && k !== 'clienteId');
  }

  fmt(value: any): string {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  }

  fmtBool(value: any): string {
    if (value === true) return 'Sim';
    if (value === false) return 'Não';
    return '—';
  }
}
