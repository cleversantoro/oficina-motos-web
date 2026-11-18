import { Component, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { Mecanico } from '../../../../core/models';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { MecanicoDetalhe } from '../mecanico-detalhe/mecanico-detalhe';

@Component({
  selector: 'app-mecanico-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MecanicoDetalhe],
  templateUrl: './mecanico-lista.html',
  styleUrl: './mecanico-lista.scss',
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
    private confirmation: Confirmation,
    private toast: Toast,
    @Optional() private router?: Router,
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
    const id = typeof item === 'object' ? item?.id : item;
    if (id != null && this.router) {
      this.router.navigate(['/mecanicos', id]);
      return;
    }
    this.loading = true;
    this.mecanicosService.get(id).subscribe({
      next: (resp: any) => { this.selected = resp; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  closeDetails(): void { this.selected = null; }

  canCreateMecanico(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'mecanicos', 'create');
  }

  canDeleteMecanico(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'mecanicos', 'delete');
  }

  async confirmDelete(id: number): Promise<void> {
    const mec = this.mecanicos.find(m => m.id === id);
    const nome = mec ? [mec.nome, mec.sobrenome].filter(Boolean).join(' ') : `Mecânico #${id}`;
    const confirmado = await this.confirmation.confirmDelete(nome);
    if (!confirmado) return;
    this.mecanicosService.delete(id).subscribe({
      next: () => {
        this.mecanicos = this.mecanicos.filter(m => m.id !== id);
        this.toast.success('Mecânico excluído', `"${nome}" foi removido com sucesso.`);
      },
      error: () => this.toast.error('Erro ao excluir', 'Não foi possível excluir o mecânico.'),
    });
  }

  prevPage(): void { this.first = Math.max(0, this.first - this.rows); }
  nextPage(): void { if (this.first + this.rows < this.filtered.length) this.first += this.rows; }

  get pageEnd(): number {
    const end = this.first + this.rows;
    return end > this.filtered.length ? this.filtered.length : end;
  }
}

export { MecanicoLista as MecanicoListaComponent };
