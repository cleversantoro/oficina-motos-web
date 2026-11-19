import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SegUsuarioTableItem } from '../../../../core/models';
import { SegurancaService } from '../../../../core/services/seguranca.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import {
  DatatableColumn,
  DatatableComponent,
  DatatableStatusOption,
} from '../../../../shared/ui/datatable';
import {
  SIMPLE_BUTTON_IMPORTS,
  SimpleTagComponent,
} from '../../../../shared/ui/simple-primitives';

export type SegUsuarioTableRow = SegUsuarioTableItem & Record<string, unknown>;

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
    DatatableComponent,
  ],
  templateUrl: './usuario-lista.html',
  styleUrl: './usuario-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioListaComponent implements OnInit {
  @ViewChild('loginTpl', { static: true }) loginTpl?: TemplateRef<{ $implicit: SegUsuarioTableRow }>;
  @ViewChild('statusTpl', { static: true }) statusTpl?: TemplateRef<{ $implicit: SegUsuarioTableRow }>;
  @ViewChild('ultimoLoginTpl', { static: true }) ultimoLoginTpl?: TemplateRef<{ $implicit: SegUsuarioTableRow }>;
  @ViewChild('acoesTpl', { static: true }) acoesTpl?: TemplateRef<{ $implicit: SegUsuarioTableRow }>;

  private readonly segurancaService = inject(SegurancaService);
  private readonly confirmation = inject(Confirmation);
  private readonly toast = inject(Toast);

  readonly usuarios = signal<SegUsuarioTableItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly busca = signal('');
  readonly deletingId = signal<number | null>(null);

  columns: DatatableColumn<SegUsuarioTableRow>[] = [];

  readonly statusOptions: readonly DatatableStatusOption[] = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' },
    { label: 'Bloqueado', value: 'Bloqueado' },
  ];

  readonly usuariosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const lista = this.usuarios();
    if (!termo) return lista;

    return lista.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.login.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        (u.perfis || '').toLowerCase().includes(termo),
    );
  });

  readonly tableRows = computed<SegUsuarioTableRow[]>(() =>
    this.usuariosFiltrados().map((u) => ({
      ...u,
      statusDescricao: u.statusDescricao || 'Ativo',
      perfis: u.perfis || '-',
    })),
  );

  ngOnInit(): void {
    this.columns = [
      { field: 'nome', header: 'Nome' },
      { field: 'login', header: 'Login', cellTemplate: this.loginTpl },
      { field: 'email', header: 'E-mail' },
      { field: 'perfis', header: 'Perfis' },
      { field: 'statusDescricao', header: 'Status', cellTemplate: this.statusTpl },
      { field: 'ultimoLogin', header: 'Último Login', cellTemplate: this.ultimoLoginTpl },
      { field: 'id', header: 'Ações', sortable: false, align: 'right', cellTemplate: this.acoesTpl },
    ];
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.segurancaService.listarUsuarios().subscribe({
      next: (lista) => {
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
        this.usuarios.update((lista) => lista.filter((u) => u.id !== usuario.id));
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
