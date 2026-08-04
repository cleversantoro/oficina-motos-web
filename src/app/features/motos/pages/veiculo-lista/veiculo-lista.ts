import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { VeiculosService } from '../../../../core/services/veiculos.service';

@Component({
  selector: 'app-veiculo-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veiculo-lista.html',
  styleUrl: './veiculo-lista.scss',
})
export class VeiculoLista implements OnInit {
  veiculos: any[] = [];
  marcas: any[]  = [];
  modelos: any[] = [];
  loading = false;
  error   = '';

  filterText = '';
  first = 0;
  rows  = 5;

  constructor(
    private svc: VeiculosService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error   = '';

    forkJoin({
      veiculos: this.svc.list(),
      marcas:   this.svc.marcas(),
      modelos:  this.svc.modelos(),
    }).subscribe({
      next: ({ veiculos, marcas, modelos }: any) => {
        this.veiculos = Array.isArray(veiculos) ? veiculos : veiculos?.data ?? [];
        this.marcas   = Array.isArray(marcas)   ? marcas   : marcas?.data   ?? [];
        this.modelos  = Array.isArray(modelos)  ? modelos  : modelos?.data  ?? [];
        this.loading  = false;
      },
      error: (err: any) => {
        this.error   = err?.error?.message ?? 'Erro ao carregar veículos.';
        this.loading = false;
      },
    });
  }

  get filtered(): any[] {
    const q = this.filterText.toLowerCase();
    if (!q) return this.veiculos;
    return this.veiculos.filter(v =>
      (v.placa        ?? '').toLowerCase().includes(q) ||
      (this.marcaNome(v.modeloId)  ?? '').toLowerCase().includes(q) ||
      (this.modeloNome(v.modeloId) ?? '').toLowerCase().includes(q) ||
      (v.cor          ?? '').toLowerCase().includes(q) ||
      (v.combustivel  ?? '').toLowerCase().includes(q)
    );
  }

  modeloNome(modeloId: number | null): string {
    if (!modeloId) return '—';
    return this.modelos.find(m => m.id === modeloId)?.nome ?? '—';
  }

  marcaNome(modeloId: number | null): string {
    if (!modeloId) return '—';
    const modelo = this.modelos.find(m => m.id === modeloId);
    if (!modelo) return '—';
    return this.marcas.find(mk => mk.id === modelo.marcaId)?.nome ?? '—';
  }

  corHex(cor: string | null): string {
    const map: Record<string, string> = {
      'Prata':    '#9ca3af',
      'Preto':    '#374151',
      'Branco':   '#f3f4f6',
      'Vermelho': '#ef4444',
      'Azul':     '#3b82f6',
      'Cinza':    '#6b7280',
      'Verde':    '#22c55e',
      'Amarelo':  '#eab308',
      'Laranja':  '#f97316',
    };
    return map[cor ?? ''] ?? '#64748b';
  }

  openDetalhe(id: number): void {
    this.router.navigate(['/motos', id]);
  }

  canDeleteVeiculo(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'veiculos', 'delete');
  }

  prevPage(): void {
    this.first = Math.max(0, this.first - this.rows);
  }

  nextPage(): void {
    if (this.first + this.rows < this.filtered.length) {
      this.first += this.rows;
    }
  }

  get pageEnd(): number {
    const end = this.first + this.rows;
    return end > this.filtered.length ? this.filtered.length : end;
  }

  confirmDelete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.veiculos = this.veiculos.filter(v => v.id !== id); },
      error: () => alert('Erro ao excluir veículo.'),
    });
  }
}
