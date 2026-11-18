import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { canPerformPermission } from '../../core/auth/rbac-access.helper';
import { Toast } from '../../shared/services/toast';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  readonly currentUser = this.auth.currentUser;
  readonly searchTerm = signal('');

  readonly initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'OM';
  });

  readonly canCreateOrdem = computed(() =>
    canPerformPermission(this.auth.permissions(), 'ordens', 'criar', this.auth.currentRole()),
  );

  onSearch(): void {
    const q = this.searchTerm().trim();
    void this.router.navigate(['/ordens'], q ? { queryParams: { q } } : undefined);
  }

  novaOrdem(): void {
    if (!this.canCreateOrdem()) {
      this.toast.warn('Acesso negado', 'Você não tem permissão para criar ordens de serviço.');
      return;
    }
    void this.router.navigate(['/ordens/novo']);
  }

  sincronizar(): void {
    const currentUrl = this.router.url || '/dashboard';
    const fallbackUrl = currentUrl.startsWith('/dashboard') ? '/ordens' : '/dashboard';
    void this.router.navigateByUrl(fallbackUrl, { skipLocationChange: true }).then(() => {
      void this.router.navigateByUrl(currentUrl);
      this.toast.info('Sincronizado', 'Dados da tela atualizados.');
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
