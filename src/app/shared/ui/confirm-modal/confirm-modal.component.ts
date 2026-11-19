import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (isOpen) {
      <div
        class="backdrop"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        (click)="onCancel()"
        (keydown.escape)="onCancel()"
      >
        <div
          class="modal-box"
          role="document"
          tabindex="-1"
          (click)="$event.stopPropagation()"
          (keydown.escape)="onCancel()"
        >
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>

          <div class="actions">
            <button type="button" class="btn-cancel" (click)="onCancel()">{{ cancelLabel }}</button>
            <button type="button" class="btn-delete" (click)="onConfirm()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-box {
        background: #ffffff;
        color: #333;
        padding: 24px;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .modal-box h3 {
        margin: 0 0 12px;
        color: #111827;
        font-size: 1.15rem;
      }
      .modal-box p {
        margin: 0;
        color: #4b5563;
        font-size: 0.95rem;
        line-height: 1.45;
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 20px;
      }
      button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
      }
      .btn-cancel {
        background: #e0e0e0;
        color: #333;
      }
      .btn-delete {
        background: #d32f2f;
        color: #fff;
      }
    `,
  ],
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar Exclusão';
  @Input() message = 'Tem certeza que deseja excluir este item?';
  @Input() confirmLabel = 'Excluir';
  @Input() cancelLabel = 'Cancelar';
  @Output() confirm = new EventEmitter<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
