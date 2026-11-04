import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { FornecedorSegmento } from '../../../../core/models/fornecedor';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { CepService } from '../../../../shared/services/cep';
import { Toast } from '../../../../shared/services/toast';
import { cepValidator, cnpjValidator } from '../../../../shared/validators';

export function formatCnpj(value: string): string {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function formatCepMask(value: string): string {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

@Component({
  selector: 'app-fornecedor-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './fornecedor-cadastro.html',
  styleUrl: './fornecedor-cadastro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FornecedorCadastroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly fornecedoresService = inject(FornecedoresService);
  private readonly cepService = inject(CepService);
  private readonly toast = inject(Toast);

  readonly loading = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly searchingCep = signal<boolean>(false);
  readonly cepError = signal<string>('');
  readonly segmentos = signal<FornecedorSegmento[]>([]);

  readonly tiposOpcoes = [
    { value: 'DISTRIBUIDOR', label: 'Distribuidor' },
    { value: 'FABRICANTE', label: 'Fabricante' },
    { value: 'IMPORTADOR', label: 'Importador' },
    { value: 'VAREJISTA', label: 'Varejista' },
    { value: 'PRESTADOR_SERVICO', label: 'Prestador de Serviço' },
  ];

  readonly statusOpcoes = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'INATIVO', label: 'Inativo' },
    { value: 'SUSPENSO', label: 'Suspenso' },
  ];

  readonly ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
  ];

  readonly form = this.fb.nonNullable.group({
    codigo: ['FOR-001', [Validators.required, Validators.maxLength(40)]],
    tipo: ['DISTRIBUIDOR', [Validators.required]],
    status: ['ATIVO', [Validators.required]],
    razaoSocial: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    nomeFantasia: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(160)]],
    documento: ['', [Validators.required, cnpjValidator()]],
    inscricaoEstadual: ['', [Validators.maxLength(40)]],
    inscricaoMunicipal: ['', [Validators.maxLength(40)]],
    segmentoPrincipalId: [null as number | null],
    email: ['', [Validators.email, Validators.maxLength(160)]],
    telefonePrincipal: ['', [Validators.maxLength(30)]],
    website: ['', [Validators.maxLength(200)]],
    condicaoPagamentoPadrao: ['', [Validators.maxLength(100)]],
    prazoEntregaMedio: [null as number | null, [Validators.min(0)]],
    prazoGarantiaPadrao: ['', [Validators.maxLength(100)]],
    atendimentoPersonalizado: [false],
    retiradaLocal: [false],
    observacoes: ['', [Validators.maxLength(500)]],
    cep: ['', [cepValidator()]],
    logradouro: ['', [Validators.maxLength(200)]],
    numero: ['', [Validators.maxLength(30)]],
    complemento: ['', [Validators.maxLength(120)]],
    bairro: ['', [Validators.maxLength(120)]],
    cidade: ['', [Validators.maxLength(120)]],
    estado: ['', [Validators.maxLength(2)]],
  });

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais(): void {
    this.loading.set(true);

    forkJoin({
      segmentos: this.fornecedoresService.segmentos().pipe(catchError(() => of([]))),
      fornecedores: this.fornecedoresService.list().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ segmentos, fornecedores }: any) => {
        const listaSegmentos: FornecedorSegmento[] = Array.isArray(segmentos)
          ? segmentos
          : segmentos?.data ?? [];
        this.segmentos.set(listaSegmentos.filter((s) => s.ativo !== false));

        const listaFornecedores = Array.isArray(fornecedores)
          ? fornecedores
          : fornecedores?.data ?? [];
        const nextNum = listaFornecedores.length + 1;
        this.form.controls.codigo.setValue(`FOR-${String(nextNum).padStart(3, '0')}`);
      });
  }

  onCnpjInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCnpj(input.value);
    this.form.controls.documento.setValue(formatted);
    this.form.controls.documento.updateValueAndValidity();
  }

  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCepMask(input.value);
    this.form.controls.cep.setValue(formatted);
    this.cepError.set('');

    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      this.buscarCep(digits);
    }
  }

  buscarCep(cepInput?: string): void {
    const rawCep = cepInput ?? this.form.controls.cep.value ?? '';
    const digits = rawCep.replace(/\D/g, '');

    if (digits.length !== 8) {
      this.cepError.set('Informe um CEP com 8 dígitos.');
      return;
    }

    this.searchingCep.set(true);
    this.cepError.set('');

    this.cepService
      .buscarCep(digits)
      .pipe(finalize(() => this.searchingCep.set(false)))
      .subscribe({
        next: (endereco) => {
          this.form.patchValue({
            logradouro: endereco.logradouro || this.form.controls.logradouro.value,
            bairro: endereco.bairro || this.form.controls.bairro.value,
            cidade: endereco.cidade || this.form.controls.cidade.value,
            estado: endereco.uf || this.form.controls.estado.value,
            complemento: endereco.complemento || this.form.controls.complemento.value,
          });
        },
        error: (err: any) => {
          this.cepError.set(err?.message ?? 'CEP não encontrado.');
        },
      });
  }

  hasError(controlName: keyof typeof this.form.controls, errorKey?: string): boolean {
    const ctrl = this.form.controls[controlName];
    if (!ctrl || (!ctrl.touched && !ctrl.dirty)) return false;
    return errorKey ? ctrl.hasError(errorKey) : ctrl.invalid;
  }

  cancelar(): void {
    this.router.navigate(['/fornecedores']);
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const cnpjLimpo = raw.documento.replace(/\D/g, '');
    const segmentoId =
      raw.segmentoPrincipalId !== null && raw.segmentoPrincipalId !== ('' as any)
        ? Number(raw.segmentoPrincipalId)
        : null;

    const payload = {
      codigo: raw.codigo.trim(),
      tipo: raw.tipo,
      razaoSocial: raw.razaoSocial.trim(),
      nomeFantasia: raw.nomeFantasia.trim(),
      documento: cnpjLimpo,
      inscricaoEstadual: raw.inscricaoEstadual.trim() || null,
      inscricaoMunicipal: raw.inscricaoMunicipal.trim() || null,
      segmentoPrincipalId: segmentoId,
      website: raw.website.trim() || null,
      email: raw.email.trim() || null,
      telefonePrincipal: raw.telefonePrincipal.trim() || null,
      status: raw.status,
      condicaoPagamentoPadrao: raw.condicaoPagamentoPadrao.trim() || null,
      prazoEntregaMedio:
        raw.prazoEntregaMedio !== null && raw.prazoEntregaMedio !== ('' as any)
          ? Number(raw.prazoEntregaMedio)
          : null,
      notaMedia: null,
      observacoes: raw.observacoes.trim() || null,
      prazoGarantiaPadrao: raw.prazoGarantiaPadrao.trim() || null,
      termosNegociados: null,
      atendimentoPersonalizado: raw.atendimentoPersonalizado,
      retiradaLocal: raw.retiradaLocal,
      ratingLogistica: null,
      ratingQualidade: null,
    };

    this.fornecedoresService
      .create(payload)
      .pipe(
        switchMap((created: any) => {
          const fornecedorId = created?.id;
          if (!fornecedorId) return of(created);

          const postRequests: Observable<any>[] = [];

          if (raw.logradouro.trim() && raw.cidade.trim()) {
            postRequests.push(
              this.fornecedoresService
                .criarEndereco({
                  fornecedorId,
                  tipo: 'Comercial',
                  cep: raw.cep.replace(/\D/g, '') || null,
                  logradouro: raw.logradouro.trim(),
                  numero: raw.numero.trim() || 'S/N',
                  bairro: raw.bairro.trim() || 'Centro',
                  cidade: raw.cidade.trim(),
                  estado: raw.estado.trim().toUpperCase() || 'SP',
                  pais: 'Brasil',
                  complemento: raw.complemento.trim() || null,
                  principal: true,
                  observacao: null,
                })
                .pipe(catchError(() => of(null)))
            );
          }

          if (segmentoId) {
            postRequests.push(
              this.fornecedoresService
                .vincularSegmento({
                  fornecedorId,
                  segmentoId,
                  principal: true,
                  observacoes: null,
                })
                .pipe(catchError(() => of(null)))
            );
          }

          return postRequests.length > 0 ? forkJoin(postRequests) : of(created);
        }),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.success('Fornecedor cadastrado com sucesso!');
          this.router.navigate(['/fornecedores']);
        },
        error: (err: any) => {
          const msg =
            err?.error?.message ??
            err?.error?.title ??
            'Não foi possível cadastrar o fornecedor. Verifique os dados informados.';
          this.toast.error(msg);
        },
      });
  }
}

export { FornecedorCadastroComponent as FornecedorCadastro };

