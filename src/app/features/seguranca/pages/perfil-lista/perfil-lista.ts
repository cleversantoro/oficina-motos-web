import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SegPerfil, SegPermissao } from '../../../../core/models';
import { SegurancaService } from '../../../../core/services/seguranca.service';
import { Toast } from '../../../../shared/services/toast';
import {
  SIMPLE_BUTTON_IMPORTS,
  SimpleTagComponent,
} from '../../../../shared/ui/simple-primitives';

@Component({
  selector: 'app-perfil-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ...SIMPLE_BUTTON_IMPORTS, SimpleTagComponent],
  templateUrl: './perfil-lista.html',
  styleUrl: './perfil-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilListaComponent implements OnInit {
  private readonly segurancaService = inject(SegurancaService);
  private readonly toast = inject(Toast);

  readonly perfis = signal<SegPerfil[]>([]);
  readonly permissoes = signal<SegPermissao[]>([]);
  readonly perfilSelecionado = signal<SegPerfil | null>(null);
  readonly permissoesSelecionadasIds = signal<number[]>([]);
  readonly loading = signal(false);
  readonly savingPermissoes = signal(false);
  readonly error = signal<string | null>(null);

  readonly permissoesAgrupadas = computed(() => {
    const grupos = new Map<string, SegPermissao[]>();
    for (const perm of this.permissoes()) {
      const modulo = perm.moduloNome || 'Geral';
      const lista = grupos.get(modulo) ?? [];
      lista.push(perm);
      grupos.set(modulo, lista);
    }
    return Array.from(grupos.entries()).map(([modulo, items]) => ({ modulo, items }));
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading.set(true);
    this.error.set(null);

    this.segurancaService.listarPerfis().subscribe({
      next: perfis => {
        this.perfis.set(perfis || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os perfis de acesso.');
        this.loading.set(false);
      },
    });

    this.segurancaService.listarPermissoes().subscribe({
      next: permissoes => this.permissoes.set(permissoes || []),
      error: () => undefined,
    });
  }

  selecionarPerfil(perfil: SegPerfil): void {
    this.perfilSelecionado.set(perfil);
    this.permissoesSelecionadasIds.set((perfil.permissoes || []).map(p => p.id));

    this.segurancaService.obterPerfil(perfil.id).subscribe({
      next: detalhado => {
        this.perfilSelecionado.set(detalhado);
        this.permissoesSelecionadasIds.set((detalhado.permissoes || []).map(p => p.id));
      },
      error: () => undefined,
    });
  }

  possuiPermissao(permissaoId: number): boolean {
    return this.permissoesSelecionadasIds().includes(permissaoId);
  }

  alternarPermissao(permissaoId: number): void {
    this.permissoesSelecionadasIds.update(ids =>
      ids.includes(permissaoId)
        ? ids.filter(id => id !== permissaoId)
        : [...ids, permissaoId],
    );
  }

  salvarPermissoes(): void {
    const perfil = this.perfilSelecionado();
    if (!perfil || this.savingPermissoes()) return;

    this.savingPermissoes.set(true);
    this.segurancaService
      .atualizarPermissoesPerfil(perfil.id, { permissaoIds: this.permissoesSelecionadasIds() })
      .subscribe({
        next: atualizado => {
          this.perfis.update(lista => lista.map(p => (p.id === atualizado.id ? atualizado : p)));
          this.perfilSelecionado.set(atualizado);
          this.savingPermissoes.set(false);
          this.toast.success('Permissões atualizadas', `Permissões do perfil "${atualizado.nome}" salvas.`);
        },
        error: () => {
          this.savingPermissoes.set(false);
          this.toast.error('Erro ao salvar', 'Não foi possível atualizar as permissões do perfil.');
        },
      });
  }
}
