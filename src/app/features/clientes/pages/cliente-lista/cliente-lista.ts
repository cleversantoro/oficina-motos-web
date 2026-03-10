import { DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { ClientesService } from '../../../../core/services/clientes.service';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [DatePipe, JsonPipe, ButtonModule, TableModule, DialogModule, TabsModule, RouterLink],
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss',
  providers: [ClientesService]
})
export class ClienteLista implements OnInit {
  clientes: any[] = [];
  loading = false;
  selectedCliente: any | null = null;

  readonly resumo = {
    ativos: 128,
    retorno: 14,
    manutencao: 12,
    emDia: 86,
  };

  first = 0;
  rows = 10;

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
    return this.clientes ? this.first + this.rows >= this.clientes.length : true;
  }

  isFirstPage(): boolean {
    return this.clientes ? this.first === 0 : true;
  }
}
