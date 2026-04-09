import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmOptions {
  message?: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
}

/**
 * Serviço wrapper para facilitar o uso de diálogos de confirmação
 * com PrimeNG ConfirmDialog
 */
@Injectable({
  providedIn: 'root',
})
export class Confirmation {
  private confirmationService = inject(ConfirmationService);

  /**
   * Exibe um diálogo de confirmação genérico
   * Retorna uma Promise que resolve com true (aceito) ou false (rejeitado)
   */
  confirm(options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: options.message || 'Tem certeza que deseja continuar?',
        header: options.header || 'Confirmação',
        icon: options.icon || 'pi pi-exclamation-triangle',
        acceptLabel: options.acceptLabel || 'Sim',
        rejectLabel: options.rejectLabel || 'Não',
        acceptButtonStyleClass: options.acceptButtonStyleClass,
        rejectButtonStyleClass: options.rejectButtonStyleClass,
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  /**
   * Diálogo específico para confirmação de exclusão
   * Estilo danger (vermelho) por padrão
   */
  confirmDelete(itemName?: string): Promise<boolean> {
    const message = itemName
      ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
      : 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.';

    return this.confirm({
      message,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
    });
  }

  /**
   * Diálogo para confirmação de ações que podem causar perda de dados
   */
  confirmDiscard(message?: string): Promise<boolean> {
    return this.confirm({
      message: message || 'Você tem alterações não salvas. Deseja descartá-las?',
      header: 'Descartar Alterações',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Descartar',
      rejectLabel: 'Continuar Editando',
      acceptButtonStyleClass: 'p-button-warning',
    });
  }

  /**
   * Diálogo para ações críticas (ex: cancelar pedidos, resetar dados)
   */
  confirmCritical(message: string, header?: string): Promise<boolean> {
    return this.confirm({
      message,
      header: header || 'Ação Crítica',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
    });
  }
}


// exemplo de uso:
// import { Component } from '@angular/core';

// async deletarSelecionados() {
//   const count = this.clientesSelecionados.length;
//   const confirmado = await this.confirmation.confirmDelete(
//     `${count} cliente(s) selecionado(s)`
//   );

//   if (confirmado) {
//     // Deleta todos...
//   }
// }
