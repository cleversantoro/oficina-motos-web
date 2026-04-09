import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { ClientesService } from '../../../../core/services/clientes.service';
import { DataTable, TableColumn, TableAction } from '../../../../shared/ui/data-table';
import { Toast } from '../../../../shared/services/toast';
import { Confirmation } from '../../../../shared/services/confirmation';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule, DatePipe, JsonPipe, FormsModule, ButtonModule, DialogModule, TabsModule, RouterLink, DataTable],
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss',
  providers: [ClientesService]
})
export class ClienteLista implements OnInit {
  private toast = inject(Toast);
  private confirmation = inject(Confirmation);
  private router = inject(Router);

  clientes: any[] = [];
  loading = false;
  selectedCliente: any | null = null;

  readonly resumo = {
    ativos: 128,
    retorno: 14,
    manutencao: 12,
    emDia: 86,
  };

  // Colunas do DataTable
  columns: TableColumn<any>[] = [
    {
      field: 'nome',
      header: 'Nome',
      sortable: true,
      filterable: true
    },
    {
      field: 'documento',
      header: 'CPF/CNPJ',
      sortable: true,
      filterable: true
    },
    {
      field: 'email',
      header: 'E-mail',
      sortable: true,
      filterable: true
    },
    {
      field: 'telefone',
      header: 'Telefone',
      sortable: false
    },
    {
      field: 'tipoDescricao',
      header: 'Tipo',
      sortable: true
    },
    {
      field: 'vip',
      header: 'VIP',
      dataType: 'boolean',
      align: 'center',
      sortable: true,
      formatter: (value) => value ? 'Sim' : 'Não'
    },
    {
      field: 'statusDescricao',
      header: 'Status',
      sortable: true
    }
  ];

  // Ações do DataTable
  actions: TableAction<any>[] = [
    {
      icon: 'pi pi-eye',
      tooltip: 'Visualizar',
      styleClass: 'p-button-rounded p-button-text p-button-info',
      onClick: (cliente) => this.openDetails(cliente)
    },
    {
      icon: 'pi pi-pencil',
      tooltip: 'Editar',
      styleClass: 'p-button-rounded p-button-text p-button-warning',
      onClick: (cliente) => this.router.navigate(['/clientes', cliente.id, 'editar'])
    },
    {
      icon: 'pi pi-trash',
      tooltip: 'Excluir',
      styleClass: 'p-button-rounded p-button-text p-button-danger',
      onClick: (cliente) => this.confirmDelete(cliente.id)
    }
  ];

  // Configurações do DataTable
  tableConfig = {
    responsive: true,
    selectable: false,
    showGridlines: true,
    hoverable: true,
    globalFilter: true,
    globalFilterPlaceholder: 'Buscar por nome, CPF/CNPJ, email...',
    exportable: true,
    emptyMessage: 'Nenhum cliente cadastrado'
  };

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

  async confirmDelete(id: number): Promise<void> {
    const cliente = this.clientes.find(c => c.id === id);
    const confirmado = await this.confirmation.confirmDelete(cliente?.nome || 'este cliente');

    if (confirmado) {
      this.clientesService.delete(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter(c => c.id !== id);
          this.toast.success('Sucesso', 'Cliente excluído com sucesso');
        },
        error: () => {
          this.toast.error('Erro', 'Erro ao excluir cliente');
        },
      });
    }
  }
}
