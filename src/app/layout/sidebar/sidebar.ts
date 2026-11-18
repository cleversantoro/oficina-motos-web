import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NavItem = {
  label: string;
  icon: string;
  route: string;
  hint?: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebar {
  readonly isOpen = input(false);
  readonly navigate = output<void>();
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  focusCloseButton(): void {
    this.closeBtn()?.nativeElement.focus();
  }

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'fa-house', route: '/dashboard', hint: 'Resumo do dia' },
    { label: 'Clientes', icon: 'fa-users', route: '/clientes', hint: 'Carteira ativa' },
    { label: 'Motos', icon: 'fa-shield-halved', route: '/motos', hint: 'Frota e fichas' },
    { label: 'Estoque', icon: 'fa-box', route: '/estoque', hint: 'Pecas e reposicao' },
    { label: 'Fornecedores', icon: 'fa-inbox', route: '/fornecedores', hint: 'Parcerias e compras' },
    { label: 'Mecanicos', icon: 'fa-gear', route: '/mecanicos', hint: 'Equipe e produtividade' },
    { label: 'Ordens de Servico', icon: 'fa-briefcase', route: '/ordens', hint: 'Fila da oficina' },
    { label: 'Financeiro', icon: 'fa-wallet', route: '/financeiro', hint: 'Fluxo e recebiveis' },
    { label: 'Seguranca', icon: 'fa-shield-halved', route: '/seguranca/usuarios', hint: 'Usuarios e perfis' },
  ];

  onNavigate(): void {
    this.navigate.emit();
  }
}
