import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import {
  CreateMecanicoRequest,
  Mecanico,
  MecanicoEspecialidade,
} from '../../../../core/models';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { Toast } from '../../../../shared/services/toast';
import {
  cpfUnicoMecanicoValidator,
  formatCpf,
} from '../../../../shared/validators';

@Component({
  selector: 'app-mecanico-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule],
  templateUrl: './mecanico-cadastro.html',
  styleUrl: './mecanico-cadastro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MecanicoCadastroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mecanicosService = inject(MecanicosService);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  // Estados reativos (Signals)
  readonly loading = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly especialidades = signal<MecanicoEspecialidade[]>([]);
  readonly especialidadesSelecionadas = signal<number[]>([]);
  readonly especialidadePrincipalId = signal<number | null>(null);
  readonly mecanicosCadastrados = signal<Mecanico[]>([]);

  readonly niveis = ['Junior', 'Pleno', 'Senior', 'Especialista'];
  readonly statusOptions = ['Ativo', 'Inativo', 'Afastado'];

  // Formulário Reativo
  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(40)]],
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(160)]],
    sobrenome: ['', [Validators.maxLength(160)]],
    nomeSocial: ['', [Validators.maxLength(160)]],
    documentoPrincipal: [
      '',
      [
        Validators.required,
        (control: AbstractControl) => cpfUnicoMecanicoValidator(() => this.mecanicosCadastrados())(control),
      ],
    ],
    dataNascimento: [''],
    dataAdmissao: [new Date().toISOString().substring(0, 10), [Validators.required]],
    status: ['Ativo', [Validators.required]],
    nivel: ['Pleno', [Validators.required]],
    valorHora: [null as number | null, [Validators.required, Validators.min(0)]],
    cargaHorariaSemanal: [44, [Validators.required, Validators.min(1)]],
    observacoes: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais(): void {
    this.loading.set(true);

    this.mecanicosService.especialidades().subscribe({
      next: (res: any) => {
        const lista: MecanicoEspecialidade[] = Array.isArray(res) ? res : res?.data ?? [];
        this.especialidades.set(lista);
      },
      error: () => {
        this.toast.error('Erro', 'Não foi possível carregar as especialidades.');
      },
    });

    this.mecanicosService.getAll<Mecanico[]>().subscribe({
      next: (res: any) => {
        const lista: Mecanico[] = Array.isArray(res) ? res : res?.data ?? [];
        this.mecanicosCadastrados.set(lista);
        this.gerarSugestaoCodigo(lista);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private gerarSugestaoCodigo(mecanicos: Mecanico[]): void {
    if (!this.form.controls.codigo.value) {
      const nextNum = mecanicos.length + 1;
      const sugerido = `MEC-${String(nextNum).padStart(3, '0')}`;
      this.form.controls.codigo.setValue(sugerido);
    }
  }

  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCpf(input.value);
    input.value = formatted;
    this.form.controls.documentoPrincipal.setValue(formatted, { emitEvent: true });
  }

  toggleEspecialidade(id: number): void {
    const atuais = this.especialidadesSelecionadas();
    if (atuais.includes(id)) {
      const atualizados = atuais.filter((item) => item !== id);
      this.especialidadesSelecionadas.set(atualizados);
      if (this.especialidadePrincipalId() === id) {
        this.especialidadePrincipalId.set(atualizados.length > 0 ? atualizados[0] : null);
      }
    } else {
      const atualizados = [...atuais, id];
      this.especialidadesSelecionadas.set(atualizados);
      if (atualizados.length === 1 || this.especialidadePrincipalId() === null) {
        this.especialidadePrincipalId.set(id);
      }
    }
  }

  setPrincipal(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.especialidadesSelecionadas().includes(id)) {
      this.especialidadesSelecionadas.update((list) => [...list, id]);
    }
    this.especialidadePrincipalId.set(id);
  }

  isEspecialidadeSelected(id: number): boolean {
    return this.especialidadesSelecionadas().includes(id);
  }

  isEspecialidadePrincipal(id: number): boolean {
    return this.especialidadePrincipalId() === id;
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) return null;
    if (control.errors['required']) return 'Campo obrigatório.';
    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    if (control.errors['min']) {
      return `Valor deve ser maior ou igual a ${control.errors['min'].min}.`;
    }
    if (control.errors['cpf']) {
      return control.errors['cpf'].message || 'CPF inválido.';
    }
    if (control.errors['cpfDuplicado']) {
      return control.errors['cpfDuplicado'].message || 'Este CPF já está cadastrado para outro mecânico.';
    }
    return 'Campo inválido.';
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error(
        'Formulário incompleto',
        'Preencha todos os campos obrigatórios corretamente antes de salvar.'
      );
      return;
    }

    if (this.submitting()) return;
    this.submitting.set(true);

    const fv = this.form.getRawValue();
    const payload: CreateMecanicoRequest = {
      codigo: fv.codigo?.trim() || '',
      nome: fv.nome?.trim() || '',
      sobrenome: fv.sobrenome?.trim() || null,
      nomeSocial: fv.nomeSocial?.trim() || null,
      documentoPrincipal: (fv.documentoPrincipal || '').replace(/\D/g, ''),
      tipoDocumento: 1,
      dataNascimento: fv.dataNascimento ? `${fv.dataNascimento}T00:00:00Z` : null,
      dataAdmissao: fv.dataAdmissao ? `${fv.dataAdmissao}T00:00:00Z` : new Date().toISOString(),
      dataDemissao: null,
      status: fv.status || 'Ativo',
      especialidadePrincipalId: this.especialidadePrincipalId(),
      nivel: fv.nivel || 'Pleno',
      valorHora: Number(fv.valorHora) || 0,
      cargaHorariaSemanal: Number(fv.cargaHorariaSemanal) || 44,
      observacoes: fv.observacoes?.trim() || null,
    };

    this.mecanicosService.create(payload).subscribe({
      next: (mecanico: any) => {
        const mecanicoId = mecanico?.id;
        const selecionadas = this.especialidadesSelecionadas();

        if (mecanicoId && selecionadas.length > 0) {
          const vinculos$ = selecionadas.map((espId) =>
            this.mecanicosService
              .vincularEspecialidade({
                mecanicoId,
                especialidadeId: espId,
                nivel: fv.nivel || 'Pleno',
                principal: espId === this.especialidadePrincipalId(),
                anotacoes: null,
              })
              .pipe(catchError(() => of(null)))
          );

          forkJoin(vinculos$).subscribe({
            next: () => {
              this.submitting.set(false);
              this.toast.success(
                'Mecânico cadastrado',
                `Mecânico "${payload.nome}" cadastrado com sucesso!`
              );
              this.router.navigate(['/mecanicos']);
            },
          });
        } else {
          this.submitting.set(false);
          this.toast.success(
            'Mecânico cadastrado',
            `Mecânico "${payload.nome}" cadastrado com sucesso!`
          );
          this.router.navigate(['/mecanicos']);
        }
      },
      error: (err: any) => {
        this.submitting.set(false);
        const msg =
          err?.error?.message ||
          'Não foi possível cadastrar o mecânico. Verifique os dados e tente novamente.';
        this.toast.error('Erro ao cadastrar', msg);
      },
    });
  }
}
