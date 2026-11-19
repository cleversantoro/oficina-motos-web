import { Component, inject, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Confirmation } from '../../shared/services/confirmation';
import { ConfirmModalComponent } from '../../shared/ui/confirm-modal';
import { LoadingSpinner } from '../../shared/ui/loading-spinner/loading-spinner';
import { ToastComponent } from '../../shared/ui/toast/toast';
import { AppFooter } from '../footer/footer';
import { AppHeader } from '../header/header';
import { AppSidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, AppHeader, AppSidebar, AppFooter, ToastComponent, LoadingSpinner, ConfirmModalComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  host: {
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class MainLayout {
  protected readonly confirmation = inject(Confirmation);
  readonly menuOpen = signal(false);
  private readonly header = viewChild(AppHeader);
  private readonly sidebar = viewChild(AppSidebar);

  toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    setTimeout(() => {
      if (next) {
        this.sidebar()?.focusCloseButton();
      } else {
        this.header()?.focusMenuToggle();
      }
    });
  }

  closeMenu(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      setTimeout(() => this.header()?.focusMenuToggle());
    }
  }
}
