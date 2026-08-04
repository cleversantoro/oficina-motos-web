import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { Mecanico } from '../../../../core/models';
import { MecanicoDetalhe } from '../mecanico-detalhe/mecanico-detalhe';

@Component({
  selector: 'app-mecanico-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, MecanicoDetalhe],
  templateUrl: './mecanico-lista.html',
  styleUrl: './mecanico-lista.scss',
  providers: [MecanicosService]
})
export class MecanicoLista implements OnInit {
  mecanicos: any[] = [];
  loading = false;
  selected: Mecanico | null = null;

  filterText = '';
  first = 0;
  rows  = 5;

  constructor(
    private mecanicosService: MecanicosService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.mecanicosService.list().subscribe({
      next: (resp: any) => {
        this.mecanicos = Array.isArray(resp) ? resp : resp?.data ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get filtered(): any[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) return this.mecanicos;
    return this.mecanicos.filter(m =>
      (m.nome              ?? '').toLowerCase().includes(q) ||
      (m.sobrenome         ?? '').toLowerCase().includes(q) ||
      (m.nivel             ?? '').toLowerCase().includes(q) ||
      (m.status            ?? '').toLowerCase().includes(q) ||
      (m.documentoPrincipal ?? '').includes(q)
    );
  }

  openDetails(item: any): void {
    this.loading = true;
    this.mecanicosService.get(item.id).subscribe({
      next: (resp: any) => { this.selected = resp; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  closeDetails(): void { this.selected = null; }

  canDeleteMecanico(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'mecanicos', 'delete');
  }

  confirmDelete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este mec\u00e2nico?')) return;
    this.mecanicosService.delete(id).subscribe({
      next: () => { this.mecanicos = this.mecanicos.filter(m => m.id !== id); },
      error: () => alert('Erro ao excluir mec\u00e2nico.'),
    });
  }

  prevPage(): void { this.first = Math.max(0, this.first - this.rows); }
  nextPage(): void { if (this.first + this.rows < this.filtered.length) this.first += this.rows; }

  get pageEnd(): number {
    const end = this.first + this.rows;
    return end > this.filtered.length ? this.filtered.length : end;
  }
}

