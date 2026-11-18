import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoadingSpinner } from '../../shared/ui/loading-spinner/loading-spinner';
import { ToastComponent } from '../../shared/ui/toast/toast';
import { AppHeader } from '../header/header';
import { AppSidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AppHeader,
    AppSidebar,
    ToastComponent,
    LoadingSpinner,
    ConfirmDialogModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class MainLayout {
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
