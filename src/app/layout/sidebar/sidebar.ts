import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

export interface NavSubItem {
  label: string;
  route: string;
  icon?: string;
  queryParams?: Record<string, string>;
  exact?: boolean;
}

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  hint?: string;
  children?: NavSubItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatRippleModule, MatButtonModule, MatDividerModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebar implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input(false);
  readonly navigate = output<void>();
  private readonly closeBtn = viewChild('closeBtn', { read: ElementRef });

  readonly expandedMenus = signal<Record<string, boolean>>({});

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'fa-house', route: '/dashboard', hint: 'Resumo do dia' },
    {
      label: 'Clientes',
      icon: 'fa-users',
      route: '/clientes',
      hint: 'Carteira ativa',
      children: [
        {
          label: 'Pessoa Física',
          icon: 'fa-user',
          route: '/clientes',
          queryParams: { tipo: 'pf' },
        },
        {
          label: 'Pessoa Jurídica',
          icon: 'fa-building',
          route: '/clientes',
          queryParams: { tipo: 'pj' },
        },
      ],
    },
    { label: 'Motos', icon: 'fa-shield-halved', route: '/motos', hint: 'Frota e fichas' },
    { label: 'Estoque', icon: 'fa-box', route: '/estoque', hint: 'Pecas e reposicao' },
    { label: 'Fornecedores', icon: 'fa-inbox', route: '/fornecedores', hint: 'Parcerias e compras' },
    { label: 'Mecanicos', icon: 'fa-gear', route: '/mecanicos', hint: 'Equipe e produtividade' },
    { label: 'Ordens de Servico', icon: 'fa-briefcase', route: '/ordens', hint: 'Fila da oficina' },
    {
      label: 'Financeiro',
      icon: 'fa-wallet',
      route: '/financeiro',
      hint: 'Fluxo e recebiveis',
      children: [
        { label: 'Visão Geral', icon: 'fa-chart-line', route: '/financeiro', exact: true },
        {
          label: 'Contas a Pagar',
          icon: 'fa-money-bill-transfer',
          route: '/financeiro/contas-pagar',
        },
        {
          label: 'Contas a Receber',
          icon: 'fa-hand-holding-dollar',
          route: '/financeiro/contas-receber',
        },
      ],
    },
    { label: 'Seguranca', icon: 'fa-shield-halved', route: '/seguranca/usuarios', hint: 'Usuarios e perfis' },
  ];

  ngOnInit(): void {
    this.syncExpandedWithUrl(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.syncExpandedWithUrl(event.urlAfterRedirects);
      });
  }

  focusCloseButton(): void {
    (this.closeBtn()?.nativeElement as HTMLButtonElement | undefined)?.focus();
  }

  isExpanded(route: string): boolean {
    return !!this.expandedMenus()[route];
  }

  toggleSubmenu(route: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.expandedMenus.update((state) => ({
      ...state,
      [route]: !state[route],
    }));
  }

  onParentNavigate(item: NavItem): void {
    if (item.children?.length) {
      this.expandedMenus.update((state) => ({
        ...state,
        [item.route]: !state[item.route],
      }));
    }
    this.onNavigate();
  }

  onNavigate(): void {
    this.navigate.emit();
  }

  private syncExpandedWithUrl(url: string): void {
    if (!url) return;
    const basePath = url.split('?')[0];
    const updates: Record<string, boolean> = {};
    for (const item of this.navItems) {
      if (item.children?.length && (basePath === item.route || basePath.startsWith(`${item.route}/`))) {
        updates[item.route] = true;
      }
    }
    if (Object.keys(updates).length > 0) {
      this.expandedMenus.update((state) => ({ ...state, ...updates }));
    }
  }
}
