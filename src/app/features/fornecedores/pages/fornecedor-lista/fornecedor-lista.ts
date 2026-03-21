import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { Fornecedor } from '../../../../core/models/fornecedor';

@Component({
  selector: 'app-fornecedor-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, RouterLink],
  templateUrl: './fornecedor-lista.html',
  styleUrl: './fornecedor-lista.scss',
})
export class FornecedorLista implements OnInit {
  fornecedores: Fornecedor[] = [];
  loading = false;
  filterText = '';

  first = 0;
  rows = 5;

  constructor(
    private svc: FornecedoresService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (data: any) => {
        this.fornecedores = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get filtered(): Fornecedor[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) return this.fornecedores;
    return this.fornecedores.filter(
      (f) =>
        f.razaoSocial?.toLowerCase().includes(q) ||
        f.nomeFantasia?.toLowerCase().includes(q) ||
        f.documento?.includes(q) ||
        f.email?.toLowerCase().includes(q),
    );
  }

  openDetalhe(id: number): void {
    this.router.navigate(['/fornecedores', id]);
  }

  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ATIVO':
        return 'pill-success';
      case 'INATIVO':
        return 'pill-danger';
      case 'SUSPENSO':
        return 'pill-warning';
      default:
        return 'pill-neutral';
    }
  }

  starsOf(nota: number | null): string {
    const n = Math.max(0, Math.min(5, Math.round(nota ?? 0)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  displayName(f: Fornecedor): string {
    return f.nomeFantasia || f.razaoSocial;
  }

  next(): void {
    this.first = this.first + this.rows;
  }
  prev(): void {
    this.first = this.first - this.rows;
  }
  reset(): void {
    this.first = 0;
  }
  isLastPage(): boolean {
    return this.first + this.rows >= this.filtered.length;
  }
  isFirstPage(): boolean {
    return this.first === 0;
  }

  confirmDelete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.fornecedores = this.fornecedores.filter((f: any) => f.id !== id); },
      error: () => alert('Erro ao excluir fornecedor.'),
    });
  }
}
