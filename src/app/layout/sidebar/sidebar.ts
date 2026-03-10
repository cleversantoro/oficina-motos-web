import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
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
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class AppSidebar {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard', hint: 'Resumo do dia' },
    { label: 'Clientes', icon: 'pi-users', route: '/clientes', hint: 'Carteira ativa' },
    { label: 'Motos', icon: 'pi-shield', route: '/motos', hint: 'Frota e fichas' },
    { label: 'Estoque', icon: 'pi-box', route: '/estoque', hint: 'Pecas e reposicao' },
    { label: 'Fornecedores', icon: 'pi-inbox', route: '/fornecedores', hint: 'Parcerias e compras' },
    { label: 'Mecanicos', icon: 'pi-cog', route: '/mecanicos', hint: 'Equipe e produtividade' },
    { label: 'Ordens de Servico', icon: 'pi-briefcase', route: '/ordens', hint: 'Fila da oficina' },
    { label: 'Financeiro', icon: 'pi-wallet', route: '/financeiro', hint: 'Fluxo e recebiveis' },
  ];
}
