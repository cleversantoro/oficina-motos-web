import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { ClientesService } from '../../../../core/services/clientes.service';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule, DatePipe, JsonPipe, FormsModule, ButtonModule, DialogModule, TabsModule, RouterLink],
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss',
  providers: [ClientesService]
})
export class ClienteLista implements OnInit {
  clientes: any[] = [];
  loading = false;
  selectedCliente: any | null = null;
  filterText = '';

  readonly resumo = {
    ativos: 128,
    retorno: 14,
    manutencao: 12,
    emDia: 86,
  };

  first = 0;
  rows = 5;

  get filtered(): any[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) return this.clientes;
    return this.clientes.filter(c =>
      (c.nome      ?? '').toLowerCase().includes(q) ||
      (c.documento ?? '').includes(q) ||
      (c.email     ?? '').toLowerCase().includes(q) ||
      (c.telefone  ?? '').includes(q)
    );
  }

  constructor(private clientesService: ClientesService) { }

  ngOnInit(): void {
    this.fetchClientes();
  }

  fetchClientes() {
    this.loading = true;
    this.clientesService.listTable().subscribe({
      next: (resp: any) => {
        this.clientes = resp;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  GetStatus(status: any): string {
    let ret = 'Status desconhecido';

    switch (status) {
      case 0:
        ret = 'Cliente Inativo';
        break;
      case 1:
        ret = 'Cliente Ativo';
        break;
      case 2:
        ret = 'Cliente Suspenso';
        break;
      case 3:
        ret = 'Cliente Bloqueado';
        break;
    }

    return ret;
  }

  GetVip(vip: any): string {
    let ret = 'SIM';

    switch (vip) {
      case true:
        ret = 'SIM';
        break;
      case false:
        ret = 'NÃO';
        break;
    }

    return ret;
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  }

  formatBoolean(value: any): string {
    if (value === true) {
      return 'SIM';
    }

    if (value === false) {
      return 'NAO';
    }

    return '-';
  }

  openDetails(cliente: any) {
    this.loading = true;
    this.clientesService.get(cliente.id).subscribe({
      next: (resp: any) => {
        this.selectedCliente = resp;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  closeDetails() {
    this.selectedCliente = null;
  }

  confirmDelete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    this.clientesService.delete(id).subscribe({
      next: () => { this.clientes = this.clientes.filter(c => c.id !== id); },
      error: () => alert('Erro ao excluir cliente.'),
    });
  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }

  // pageChange(even: any) {
  //   this.first = event.first;
  //   this.rows = event.rows;
  // }

  isLastPage(): boolean {
    return this.filtered ? this.first + this.rows >= this.filtered.length : true;
  }

  isFirstPage(): boolean {
    return this.filtered ? this.first === 0 : true;
  }
}
