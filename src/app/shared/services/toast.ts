import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail?: string;
  life?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Toast {
  private messagesSignal = signal<ToastMessage[]>([]);

  // Expor como readonly para evitar modificações externas
  readonly messages = this.messagesSignal.asReadonly();

  /**
   * Mostra uma mensagem de sucesso
   */
  success(summary: string, detail?: string, life = 3000) {
    this.addMessage('success', summary, detail, life);
  }

  /**
   * Mostra uma mensagem de erro
   */
  error(summary: string, detail?: string, life = 5000) {
    this.addMessage('error', summary, detail, life);
  }

  /**
   * Mostra uma mensagem de aviso
   */
  warn(summary: string, detail?: string, life = 4000) {
    this.addMessage('warn', summary, detail, life);
  }

  /**
   * Mostra uma mensagem informativa
   */
  info(summary: string, detail?: string, life = 3000) {
    this.addMessage('info', summary, detail, life);
  }

  /**
   * Remove todas as mensagens
   */
  clear() {
    this.messagesSignal.set([]);
  }

  /**
   * Remove uma mensagem específica pelo ID
   */
  remove(id: string) {
    this.messagesSignal.update(messages =>
      messages.filter(msg => msg.id !== id)
    );
  }

  private addMessage(
    severity: ToastMessage['severity'],
    summary: string,
    detail?: string,
    life?: number
  ) {
    const message: ToastMessage = {
      id: this.generateId(),
      severity,
      summary,
      detail,
      life,
    };

    this.messagesSignal.update(messages => [...messages, message]);

    // Auto-remover mensagem após o tempo de vida
    if (life) {
      setTimeout(() => this.remove(message.id), life);
    }
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
