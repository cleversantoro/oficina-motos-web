import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { OrdensService } from '../../../../core/services/ordens.service';
import { OrdemServico } from '../../../../core/models';

@Component({
  selector: 'app-os-detalhe',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule, DialogModule, TabsModule],
  templateUrl: './os-detalhe.html',
  styleUrl: './os-detalhe.scss',
  providers: [OrdensService]
})
export class OsDetalhe implements OnInit {
  ordens: any[] = [];
  loading = false;
  selected: OrdemServico | null = null;

  filterText = '';
  first = 0;
  rows = 5;

  constructor(
    private ordensService: OrdensService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.fetchOrdens();
  }

  fetchOrdens() {
    this.loading = true;
    this.ordensService.list().subscribe({
      next: (resp: any) => { this.ordens = resp; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): any[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) return this.ordens;
    return this.ordens.filter(os => {
      const status = String(os?.status ?? '').trim().toLowerCase();
      const problema = String(os?.descricaoProblema ?? '').trim().toLowerCase();

      return String(os?.id ?? '').includes(q) ||
        status.includes(q) ||
        problema.includes(q) ||
        String(os?.clienteId ?? '').includes(q) ||
        String(os?.mecanicoId ?? '').includes(q);
    });
  }

  openDetails(item: any) {
    this.loading = true;
    this.ordensService.get(item.id).subscribe({
      next: (resp: any) => { this.selected = resp; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  closeDetails() { this.selected = null; }

  canDeleteOrdem(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'ordens', 'delete');
  }

  confirmDelete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta OS?')) return;
    this.ordensService.delete(id).subscribe({
      next: () => { this.ordens = this.ordens.filter(os => os.id !== id); },
      error: () => alert('Erro ao excluir OS.'),
    });
  }

  prevPage(): void { this.first = Math.max(0, this.first - this.rows); }
  nextPage(): void { if (this.first + this.rows < this.filtered.length) this.first += this.rows; }

  get pageEnd(): number {
    const end = this.first + this.rows;
    return end > this.filtered.length ? this.filtered.length : end;
  }

  totalItens(os: OrdemServico): number {
    return os.itens?.reduce((s, i) => s + i.total, 0) ?? 0;
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }
}
