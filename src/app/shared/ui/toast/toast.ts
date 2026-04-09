import { Component, inject, effect } from '@angular/core';
import { Toast as ToastService } from '../../services/toast';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastModule],
  providers: [MessageService],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  private toastService = inject(ToastService);
  private messageService = inject(MessageService);

  constructor() {
    // Effect para sincronizar mensagens do signal com o PrimeNG MessageService
    effect(() => {
      const messages = this.toastService.messages();

      // Limpa mensagens antigas do PrimeNG
      this.messageService.clear();

      // Adiciona novas mensagens
      messages.forEach(msg => {
        this.messageService.add({
          key: 'app-toast',
          severity: msg.severity,
          summary: msg.summary,
          detail: msg.detail,
          life: msg.life,
        });
      });
    });
  }
}
