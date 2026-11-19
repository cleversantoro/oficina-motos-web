import { CommonModule } from '@angular/common';
import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformBusinessAction } from '../../../../core/auth/rbac-access.helper';
import { Mecanico } from '../../../../core/models';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { ConfirmModalComponent } from '../../../../shared/ui/confirm-modal';
import { DatatableColumn, DatatableComponent } from '../../../../shared/ui/datatable';
import { MecanicoDetalhe } from '../mecanico-detalhe/mecanico-detalhe';

@Component({
  selector: 'app-mecanico-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MecanicoDetalhe, DatatableComponent, ConfirmModalComponent],
  templateUrl: './mecanico-lista.html',
  styleUrl: './mecanico-lista.scss',
})
export class MecanicoLista implements OnInit {
  @ViewChild('nomeTpl', { static: true }) nomeTpl?: TemplateRef<{ $implicit: any }>;
  @ViewChild('statusTpl', { static: true }) statusTpl?: TemplateRef<{ $implicit: any }>;
  @ViewChild('valorHoraTpl', { static: true }) valorHoraTpl?: TemplateRef<{ $implicit: any }>;
  @ViewChild('acoesTpl', { static: true }) acoesTpl?: TemplateRef<{ $implicit: any }>;

  mecanicos: any[] = [];
  loading = false;
  selected: Mecanico | null = null;
  mostrarModal = false;
  itemParaDeletarId: number | null = null;

  filterText = '';
  first = 0;
  rows = 5;

  columns: DatatableColumn<any>[] = [];

  constructor(
    private mecanicosService: MecanicosService,
    private authService: AuthService,
    private _confirmation: Confirmation,
    private toast: Toast,
    @Optional() private router?: Router,
  ) {}

  ngOnInit(): void {
    this.columns = [
      { field: 'nome', header: 'Nome', subField: 'sobrenome', cellTemplate: this.nomeTpl },
      { field: 'nivel', header: 'Nível' },
      { field: 'status', header: 'Status', cellTemplate: this.statusTpl },
      { field: 'documentoPrincipal', header: 'Documento' },
      { field: 'valorHora', header: 'Valor/Hora', cellTemplate: this.valorHoraTpl },
      { field: 'id', header: 'Ações', sortable: false, align: 'right', cellTemplate: this.acoesTpl },
    ];
    this.load();
  }

  load(): void {
    this.loading = true;
    this.mecanicosService.list().subscribe({
      next: (resp: any) => {
        this.mecanicos = Array.isArray(resp) ? resp : resp?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get filtered(): any[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) return this.mecanicos;
    return this.mecanicos.filter(
      (m) =>
        (m.nome ?? '').toLowerCase().includes(q) ||
        (m.sobrenome ?? '').toLowerCase().includes(q) ||
        (m.nivel ?? '').toLowerCase().includes(q) ||
        (m.status ?? '').toLowerCase().includes(q) ||
        (m.documentoPrincipal ?? '').includes(q),
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
      next: (resp: any) => {
        this.selected = resp;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  closeDetails(): void {
    this.selected = null;
  }

  canCreateMecanico(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'mecanicos', 'create');
  }

  canDeleteMecanico(): boolean {
    return canPerformBusinessAction(this.authService.currentRole(), 'mecanicos', 'delete');
  }

  abrirModal(id: number): void {
    this.itemParaDeletarId = id;
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.itemParaDeletarId = null;
  }

  executarExclusao(): void {
    if (this.itemParaDeletarId !== null) {
      const id = this.itemParaDeletarId;
      const mec = this.mecanicos.find((m) => m.id === id);
      const nome = mec ? [mec.nome, mec.sobrenome].filter(Boolean).join(' ') : `Mecânico #${id}`;
      this.mecanicosService.delete(id).subscribe({
        next: () => {
          this.mecanicos = this.mecanicos.filter((m) => m.id !== id);
          this.toast.success('Mecânico excluído', `"${nome}" foi removido com sucesso.`);
        },
        error: () =>
          this.toast.error('Erro ao excluir', 'Não foi possível excluir o mecânico.'),
      });
    }
    this.fecharModal();
  }

  confirmDelete(id: number): void {
    this.abrirModal(id);
  }
}

export { MecanicoLista as MecanicoListaComponent };
