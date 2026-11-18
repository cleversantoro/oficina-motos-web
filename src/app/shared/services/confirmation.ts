import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  message?: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
}

export interface ActiveConfirmDialog {
  message: string;
  header: string;
  icon: string;
  acceptLabel: string;
  rejectLabel: string;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
  resolve: (accepted: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class Confirmation {
  private readonly dialogSignal = signal<ActiveConfirmDialog | null>(null);
  readonly activeDialog = this.dialogSignal.asReadonly();

  confirm(options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialogSignal.set({
        message: options.message || 'Tem certeza que deseja continuar?',
        header: options.header || 'Confirmação',
        icon: options.icon || 'fa-solid fa-triangle-exclamation',
        acceptLabel: options.acceptLabel || 'Sim',
        rejectLabel: options.rejectLabel || 'Não',
        acceptButtonStyleClass: options.acceptButtonStyleClass,
        rejectButtonStyleClass: options.rejectButtonStyleClass,
        resolve,
      });
    });
  }

  accept(): void {
    const current = this.dialogSignal();
    this.dialogSignal.set(null);
    current?.resolve(true);
  }

  reject(): void {
    const current = this.dialogSignal();
    this.dialogSignal.set(null);
    current?.resolve(false);
  }

  confirmDelete(itemName?: string): Promise<boolean> {
    const message = itemName
      ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
      : 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.';

    return this.confirm({
      message,
      header: 'Confirmar Exclusão',
      icon: 'fa-solid fa-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'btn-danger',
    });
  }

  confirmDiscard(message?: string): Promise<boolean> {
    return this.confirm({
      message: message || 'Você tem alterações não salvas. Deseja descartá-las?',
      header: 'Descartar Alterações',
      icon: 'fa-solid fa-circle-exclamation',
      acceptLabel: 'Descartar',
      rejectLabel: 'Continuar Editando',
      acceptButtonStyleClass: 'btn-warning',
    });
  }

  confirmCritical(message: string, header?: string): Promise<boolean> {
    return this.confirm({
      message,
      header: header || 'Ação Crítica',
      icon: 'fa-solid fa-triangle-exclamation',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'btn-danger',
    });
  }
}
