import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  CreateSegUsuarioRequest,
  SegPerfil,
  UpdateSegUsuarioRequest,
} from '../../../../core/models';
import { SegurancaService } from '../../../../core/services/seguranca.service';
import { Toast } from '../../../../shared/services/toast';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly segurancaService = inject(SegurancaService);
  private readonly toast = inject(Toast);

  readonly perfis = signal<SegPerfil[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly usuarioId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.usuarioId() !== null);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    login: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    perfilId: [0, [Validators.required, Validators.min(1)]],
    status: [1],
  });

  ngOnInit(): void {
    this.carregarPerfis();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (Number.isInteger(id) && id > 0) {
        this.usuarioId.set(id);
        this.form.controls.senha.clearValidators();
        this.form.controls.senha.updateValueAndValidity();
        this.carregarUsuario(id);
      }
    }
  }

  private carregarPerfis(): void {
    this.segurancaService.listarPerfis().subscribe({
      next: lista => this.perfis.set(lista || []),
      error: () => this.toast.error('Erro', 'Não foi possível carregar os perfis de acesso.'),
    });
  }

  private carregarUsuario(id: number): void {
    this.loading.set(true);
    this.segurancaService.obterUsuario(id).subscribe({
      next: usuario => {
        const perfilPrincipalId = usuario.perfis?.[0]?.id ?? 0;
        this.form.patchValue({
          nome: usuario.nome,
          login: usuario.login,
          email: usuario.email,
          telefone: usuario.telefone || '',
          perfilId: perfilPrincipalId,
          status: usuario.status,
          senha: '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro', 'Usuário não encontrado.');
        this.router.navigate(['/seguranca/usuarios']);
      },
    });
  }

  salvar(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);

    const id = this.usuarioId();
    if (id !== null) {
      const payload: UpdateSegUsuarioRequest = {
        nome: raw.nome.trim(),
        login: raw.login.trim(),
        email: raw.email.trim(),
        telefone: raw.telefone.trim() || null,
        status: Number(raw.status),
        perfilId: Number(raw.perfilId) || null,
      };

      this.segurancaService.atualizarUsuario(id, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Usuário atualizado', 'Os dados do usuário foram salvos com sucesso.');
          this.router.navigate(['/seguranca/usuarios']);
        },
        error: () => {
          this.saving.set(false);
          this.toast.error('Erro ao atualizar', 'Não foi possível atualizar o usuário.');
        },
      });
      return;
    }

    const createPayload: CreateSegUsuarioRequest = {
      nome: raw.nome.trim(),
      login: raw.login.trim(),
      email: raw.email.trim(),
      senha: raw.senha,
      telefone: raw.telefone.trim() || null,
      perfilId: Number(raw.perfilId),
    };

    this.segurancaService.criarUsuario(createPayload).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Usuário criado', 'Novo usuário cadastrado com sucesso.');
        this.router.navigate(['/seguranca/usuarios']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erro ao criar', 'Não foi possível cadastrar o usuário.');
      },
    });
  }
}
