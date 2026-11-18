import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SegUsuarioTableItem } from '../../../../core/models';
import { SegurancaService } from '../../../../core/services/seguranca.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import {
  SIMPLE_BUTTON_IMPORTS,
  SimpleTagComponent,
} from '../../../../shared/ui/simple-primitives';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RouterLink,
    ...SIMPLE_BUTTON_IMPORTS,
    SimpleTagComponent,
  ],
  templateUrl: './usuario-lista.html',
  styleUrl: './usuario-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioListaComponent implements OnInit {
  private readonly segurancaService = inject(SegurancaService);
  private readonly confirmation = inject(Confirmation);
  private readonly toast = inject(Toast);

  readonly usuarios = signal<SegUsuarioTableItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly busca = signal('');
  readonly deletingId = signal<number | null>(null);

  readonly usuariosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const lista = this.usuarios();
    if (!termo) return lista;

    return lista.filter(u =>
      u.nome.toLowerCase().includes(termo) ||
      u.login.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      (u.perfis || '').toLowerCase().includes(termo),
    );
  });

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.segurancaService.listarUsuarios().subscribe({
      next: lista => {
        this.usuarios.set(lista || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar a lista de usuários.');
        this.loading.set(false);
      },
    });
  }

  getStatusSeverity(status: number): 'success' | 'danger' | 'warn' | 'secondary' {
    if (status === 1) return 'success';
    if (status === 2) return 'warn';
    if (status === 0) return 'danger';
    return 'secondary';
  }

  async confirmarExclusao(usuario: SegUsuarioTableItem): Promise<void> {
    if (this.deletingId() !== null) return;

    const confirmado = await this.confirmation.confirmDelete(usuario.nome);
    if (!confirmado) return;

    this.deletingId.set(usuario.id);
    this.segurancaService.excluirUsuario(usuario.id).subscribe({
      next: () => {
        this.usuarios.update(lista => lista.filter(u => u.id !== usuario.id));
        this.deletingId.set(null);
        this.toast.success('Usuário excluído', `"${usuario.nome}" foi removido com sucesso.`);
      },
      error: () => {
        this.deletingId.set(null);
        this.toast.error('Erro ao excluir', 'Não foi possível excluir o usuário.');
      },
    });
  }
}
