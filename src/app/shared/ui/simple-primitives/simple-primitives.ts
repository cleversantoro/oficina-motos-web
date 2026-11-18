import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  inject,
  signal,
} from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ng-template[pTemplate]',
  standalone: true,
})
export class SimpleTemplateDirective {
  @Input('pTemplate') name = '';
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[pInputText]',
  standalone: true,
  host: {
    class: 'p-inputtext',
  },
})
export class SimpleInputTextDirective {}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[pTooltip]',
  standalone: true,
  host: {
    '[attr.title]': 'tooltip || null',
  },
})
export class SimpleTooltipDirective {
  @Input('pTooltip') tooltip = '';
  @Input() tooltipPosition = 'top';
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[pButton], a[pButton]',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-button',
    '[class.p-disabled]': 'loading',
  },
  template: `
    @if (loading) {
      <i class="fa-solid fa-spin fa-spinner p-button-icon" aria-hidden="true"></i>
    } @else if (icon) {
      <i [class]="'p-button-icon ' + icon" aria-hidden="true"></i>
    }
    @if (label) {
      <span class="p-button-label">{{ label }}</span>
    }
    <ng-content />
  `,
})
export class SimpleButtonDirectiveComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() loading = false;
  @Input() severity = '';
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'p-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="'p-button ' + styleClass"
      [class.p-button-outlined]="outlined"
      [class.p-button-text]="text"
      [class.p-button-sm]="size === 'small'"
      [class.p-button-danger]="severity === 'danger'"
      [class.p-button-secondary]="severity === 'secondary'"
      (click)="onClick.emit($event)"
    >
      @if (loading) {
        <i class="fa-solid fa-spin fa-spinner p-button-icon" aria-hidden="true"></i>
      } @else if (icon) {
        <i [class]="'p-button-icon ' + icon" aria-hidden="true"></i>
      }
      @if (label) {
        <span class="p-button-label">{{ label }}</span>
      }
      <ng-content />
    </button>
  `,
})
export class SimpleButtonComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() size = '';
  @Input() severity = '';
  @Input() outlined = false;
  @Input() text = false;
  @Input() rounded = false;
  @Input() loading = false;
  @Input() disabled = false;
  @Input() styleClass = '';
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onClick = new EventEmitter<MouseEvent>();
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'p-tag',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="p-tag" [attr.data-severity]="severity || 'info'" [class]="styleClass">
      @if (icon) {
        <i [class]="icon" aria-hidden="true"></i>
      }
      <span>{{ value }}</span>
      <ng-content />
    </span>
  `,
  styles: [
    `
      .p-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.3);
      }
      .p-tag[data-severity='success'] {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
        border-color: rgba(34, 197, 94, 0.35);
      }
      .p-tag[data-severity='warn'],
      .p-tag[data-severity='warning'] {
        background: rgba(234, 179, 8, 0.15);
        color: #facc15;
        border-color: rgba(234, 179, 8, 0.35);
      }
      .p-tag[data-severity='danger'] {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border-color: rgba(239, 68, 68, 0.35);
      }
      .p-tag[data-severity='secondary'],
      .p-tag[data-severity='contrast'] {
        background: rgba(148, 163, 184, 0.15);
        color: #cbd5e1;
        border-color: rgba(148, 163, 184, 0.3);
      }
    `,
  ],
})
export class SimpleTagComponent {
  @Input() value = '';
  @Input() severity: string | undefined = 'info';
  @Input() icon = '';
  @Input() rounded = false;
  @Input() styleClass = '';
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'p-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible) {
      <div class="p-dialog-mask" role="dialog" aria-modal="true" [attr.aria-label]="header || 'Diálogo'">
        <div class="p-dialog {{ styleClass }}" [ngStyle]="style">
          @if (showHeader) {
            <div class="p-dialog-header">
              <span class="p-dialog-title">{{ header }}</span>
              @if (closable) {
                <button
                  type="button"
                  class="p-dialog-header-close"
                  aria-label="Fechar"
                  (click)="close()"
                >
                  <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
              }
            </div>
          }
          <div class="p-dialog-content" [ngStyle]="contentStyle">
            <ng-content />
          </div>
          @if (footerTemplate) {
            <div class="p-dialog-footer">
              <ng-container *ngTemplateOutlet="footerTemplate" />
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .p-dialog-mask {
        position: fixed;
        inset: 0;
        z-index: 1100;
        background: rgba(2, 6, 23, 0.72);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .p-dialog {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        color: #e2e8f0;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-weight: 700;
      }
      .p-dialog-header-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 0.25rem;
      }
      .p-dialog-content {
        padding: 1.25rem;
        overflow-y: auto;
      }
      .p-dialog-footer {
        padding: 0.9rem 1.25rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
    `,
  ],
})
export class SimpleDialogComponent {
  @Input() visible = false;
  @Input() modal = true;
  @Input() draggable = false;
  @Input() resizable = false;
  @Input() closable = true;
  @Input() dismissableMask = false;
  @Input() showHeader = true;
  @Input() header = '';
  @Input() styleClass = '';
  @Input() style: Record<string, string> | null = null;
  @Input() contentStyle: Record<string, string> | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onHide = new EventEmitter<void>();

  @ContentChildren(SimpleTemplateDirective)
  templates?: QueryList<SimpleTemplateDirective>;

  get footerTemplate(): TemplateRef<unknown> | null {
    return this.templates?.find((t) => t.name === 'footer')?.template ?? null;
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onHide.emit();
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'p-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="p-tabs"><ng-content /></div>`,
})
export class SimpleTabsComponent implements OnChanges {
  @Input() value = '0';
  readonly activeValue = signal('0');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value !== undefined) {
      this.activeValue.set(String(this.value));
    }
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'p-tablist',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="p-tablist" role="tablist"><ng-content /></div>`,
  styles: [
    `
      .p-tablist {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
    `,
  ],
})
export class SimpleTabListComponent {}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'p-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tab',
    tabindex: '0',
    class: 'p-tab',
    '[class.p-tab-active]': 'isActive()',
    '[attr.aria-selected]': 'isActive()',
    '(click)': 'select()',
    '(keydown.enter)': 'select()',
  },
  template: `<ng-content />`,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.7rem 1rem;
        cursor: pointer;
        color: #94a3b8;
        font-size: 0.85rem;
        font-weight: 600;
        border-bottom: 2px solid transparent;
        user-select: none;
      }
      :host(.p-tab-active) {
        color: #f97316;
        border-bottom-color: #f97316;
      }
    `,
  ],
})
export class SimpleTabComponent {
  private readonly tabs = inject(SimpleTabsComponent, { optional: true });
  @Input() value = '0';

  isActive(): boolean {
    return (this.tabs?.activeValue() ?? '0') === String(this.value);
  }

  select(): void {
    this.tabs?.activeValue.set(String(this.value));
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'p-tabpanels',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="p-tabpanels"><ng-content /></div>`,
})
export class SimpleTabPanelsComponent {}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'p-tabpanel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isActive()) {
      <div class="p-tabpanel" role="tabpanel">
        <ng-content />
      </div>
    }
  `,
})
export class SimpleTabPanelComponent {
  private readonly tabs = inject(SimpleTabsComponent, { optional: true });
  @Input() value = '0';

  isActive(): boolean {
    return (this.tabs?.activeValue() ?? '0') === String(this.value);
  }
}

export const SIMPLE_TABS_IMPORTS = [
  SimpleTabsComponent,
  SimpleTabListComponent,
  SimpleTabComponent,
  SimpleTabPanelsComponent,
  SimpleTabPanelComponent,
] as const;

export const SIMPLE_DIALOG_IMPORTS = [
  SimpleDialogComponent,
  SimpleTemplateDirective,
] as const;

export const SIMPLE_BUTTON_IMPORTS = [
  SimpleButtonComponent,
  SimpleButtonDirectiveComponent,
] as const;
