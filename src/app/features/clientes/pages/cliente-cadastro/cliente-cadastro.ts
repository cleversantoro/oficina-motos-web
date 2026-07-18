import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Toast } from '../../../../shared/services/toast';
import {
  cepValidator,
  celularValidator,
  cnpjValidator,
  cpfValidator,
} from '../../../../shared/validators';

type TabId = 'perfil' | 'contato' | 'financeiro' | 'legal' | 'anexos';

@Component({
  selector: 'app-cliente-cadastro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, ButtonModule],
  templateUrl: './cliente-cadastro.html',
  styleUrl: './cliente-cadastro.scss',
})
export class ClienteCadastro implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(Toast);

  activeTab: TabId = 'perfil';
  saving = false;
  saveError: string | null = null;
  cepLoading = new Set<number>();

  readonly tabs: { id: TabId; label: string; desc: string }[] = [
    { id: 'perfil', label: 'Perfil & Identidade', desc: 'PF/PJ, status e origem' },
    { id: 'contato', label: 'Contato & Localizacao', desc: 'Telefones e enderecos' },
    { id: 'financeiro', label: 'Financeiro & Comercial', desc: 'Limite, indicacoes' },
    { id: 'legal', label: 'Legal & Compliance', desc: 'Documentos e LGPD' },
    { id: 'anexos', label: 'Arquivos', desc: 'Uploads e comprovantes' },
  ];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // ── Perfil ──────────────────────────────────────────────
      tipo: ['pf'],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      nomeExibicao: [''],
      status: [1, Validators.required],
      vip: [false],
      observacoes: [''],
      origemId: [null],

      // PF
      cpf: ['', [Validators.required, cpfValidator()]],
      rg: [''],
      dataNascimento: [''],
      genero: [''],
      estadoCivil: [''],
      profissao: [''],

      // PJ
      cnpj: ['', cnpjValidator()],
      razaoSocial: [''],
      nomeFantasia: [''],
      inscricaoEstadual: [''],
      inscricaoMunicipal: [''],
      responsavel: [''],

      // ── Contato ─────────────────────────────────────────────
      email: ['', Validators.email],
      telefone: ['', celularValidator()],
      contatos: this.fb.array([]),
      enderecos: this.fb.array([]),

      // ── Financeiro ──────────────────────────────────────────
      limiteCredito: [null],
      prazoPagamento: [null],
      bloqueado: [false],
      financeiroObservacoes: [''],
      indicadorNome: [''],
      indicadorTelefone: [''],
      indicacaoObservacao: [''],

      // ── Legal ───────────────────────────────────────────────
      lgpdTermos: [false],
      lgpdMarketing: [false],
    });
  }

  get isPessoaFisica(): boolean {
    return this.form.get('tipo')?.value === 'pf';
  }

  get contatos(): FormArray {
    return this.form.get('contatos') as FormArray;
  }

  get enderecos(): FormArray {
    return this.form.get('enderecos') as FormArray;
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  setTipo(tipo: 'pf' | 'pj'): void {
    this.form.patchValue({ tipo });
    // Clear cross-type validation when switching
    if (tipo === 'pf') {
      this.form.patchValue({ cnpj: '', razaoSocial: '' });
    } else {
      this.form.patchValue({ cpf: '', rg: '' });
    }
  }

  onTabSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value as TabId | undefined;
    if (value) this.setTab(value);
  }

  addContato(): void {
    this.contatos.push(
      this.fb.group({
        tipo: [1, Validators.required],
        valor: ['', Validators.required],
        principal: [false],
        observacao: [''],
      }),
    );
  }

  removeContato(i: number): void {
    this.contatos.removeAt(i);
  }

  addEndereco(): void {
    this.enderecos.push(
      this.fb.group({
        tipo: [1, Validators.required],
        cep: ['', [Validators.required, cepValidator()]],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        estado: ['', [Validators.required, Validators.maxLength(2)]],
        complemento: [''],
        pais: ['Brasil'],
        principal: [false],
      }),
    );
  }

  removeEndereco(i: number): void {
    this.enderecos.removeAt(i);
  }

  // ── Masking ──────────────────────────────────────────────────────────────────

  applyMask(ctrl: AbstractControl | null, type: 'cpf' | 'cnpj' | 'cep' | 'phone', event: Event): void {
    if (!ctrl) return;
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '');

    switch (type) {
      case 'cpf':
        v = v.substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2')
             .replace(/(\d{3})(\d)/, '$1.$2')
             .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        break;
      case 'cnpj':
        v = v.substring(0, 14);
        v = v.replace(/(\d{2})(\d)/, '$1.$2')
             .replace(/(\d{3})(\d)/, '$1.$2')
             .replace(/(\d{3})(\d)/, '$1/$2')
             .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        break;
      case 'cep':
        v = v.substring(0, 8);
        v = v.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
        break;
      case 'phone':
        v = v.substring(0, 11);
        if (v.length === 11) {
          v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (v.length === 10) {
          v = v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (v.length > 2) {
          v = v.replace(/(\d{2})(\d+)/, '($1) $2');
        }
        break;
    }

    input.value = v;
    ctrl.setValue(v, { emitEvent: false });
    ctrl.markAsDirty();
  }

  // ── CEP auto-search (ViaCEP) ─────────────────────────────────────────────────

  buscarCep(ctrl: AbstractControl, index: number): void {
    const group = ctrl as FormGroup;
    const cep = (group.get('cep')?.value ?? '').replace(/\D/g, '');
    if (cep.length !== 8) return;

    this.cepLoading.add(index);
    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (data) => {
        if (data.erro) {
          group.get('cep')?.setErrors({ cepNotFound: true });
        } else {
          group.patchValue({
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          });
        }
        this.cepLoading.delete(index);
      },
      error: () => this.cepLoading.delete(index),
    });
  }

  isCepLoading(index: number): boolean {
    return this.cepLoading.has(index);
  }

  cepError(ctrl: AbstractControl): string | null {
    const c = (ctrl as FormGroup).get('cep');
    if (!c || !c.invalid || !(c.dirty || c.touched)) return null;
    if (c.errors?.['required']) return 'CEP é obrigatório.';
    if (c.errors?.['cep']) return c.errors['cep'].message || 'CEP inválido.';
    if (c.errors?.['cepNotFound']) return 'CEP não encontrado.';
    return 'CEP inválido.';
  }

  isInvalid(ctrl: AbstractControl | null): boolean {
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  field(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  asGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  async onSave(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.setTab('perfil');
      return;
    }

    const v = this.form.value;
    this.saving = true;
    this.saveError = null;

    this.clientesService
      .create({
        nome: v.nome,
        cpf: this.isPessoaFisica ? v.cpf : '',
        email: v.email ?? '',
        telefone: v.telefone ?? '',
      })
      .subscribe({
        next: (cliente: any) => {
          const clienteId: number = cliente.id;
          const sub$ = this.buildSubRequests(clienteId, v);
          let pending = sub$.length;

          if (pending === 0) {
            this.onComplete(clienteId);
            return;
          }

          let failed = false;
          sub$.forEach((obs) =>
            obs.subscribe({
              next: () => {
                pending--;
                if (pending === 0 && !failed) this.onComplete(clienteId);
              },
              error: (err: any) => {
                if (!failed) {
                  failed = true;
                  this.saving = false;
                  this.saveError = err?.error?.message ?? 'Erro ao salvar dados adicionais.';
                }
              },
            }),
          );
        },
        error: (err: any) => {
          this.saving = false;
          this.saveError = err?.error?.message ?? 'Erro ao criar cliente.';
        },
      });
  }

  private buildSubRequests(clienteId: number, v: any): any[] {
    const reqs: any[] = [];

    // PF
    if (this.isPessoaFisica && v.cpf) {
      reqs.push(
        this.clientesService.createPf({
          clienteId,
          cpf: v.cpf,
          rg: v.rg || null,
          dataNascimento: v.dataNascimento || null,
          genero: v.genero || null,
          estadoCivil: v.estadoCivil || null,
          profissao: v.profissao || null,
        }),
      );
    }

    // PJ
    if (!this.isPessoaFisica && v.cnpj) {
      reqs.push(
        this.clientesService.createPj({
          clienteId,
          cnpj: v.cnpj,
          razaoSocial: v.razaoSocial,
          nomeFantasia: v.nomeFantasia || null,
          inscricaoEstadual: v.inscricaoEstadual || null,
          inscricaoMunicipal: v.inscricaoMunicipal || null,
          responsavel: v.responsavel || null,
        }),
      );
    }

    // Financeiro
    if (v.limiteCredito || v.prazoPagamento) {
      reqs.push(
        this.clientesService.createFinanceiro({
          clienteId,
          limiteCredito: v.limiteCredito ?? null,
          prazoPagamento: v.prazoPagamento ?? null,
          bloqueado: v.bloqueado ?? false,
          observacoes: v.financeiroObservacoes || null,
        }),
      );
    }

    // Indicação
    if (v.indicadorNome) {
      reqs.push(
        this.clientesService.createIndicacao({
          clienteId,
          indicadorNome: v.indicadorNome,
          indicadorTelefone: v.indicadorTelefone || null,
          observacao: v.indicacaoObservacao || null,
        }),
      );
    }

    // Contatos
    (v.contatos as any[]).forEach((c) =>
      reqs.push(
        this.clientesService.createContato({
          clienteId,
          tipo: c.tipo,
          valor: c.valor,
          principal: c.principal,
          observacao: c.observacao || null,
        }),
      ),
    );

    // Endereços
    (v.enderecos as any[]).forEach((e) =>
      reqs.push(
        this.clientesService.createEndereco({
          clienteId,
          tipo: e.tipo,
          cep: e.cep,
          logradouro: e.logradouro,
          numero: e.numero,
          bairro: e.bairro,
          cidade: e.cidade,
          estado: e.estado,
          complemento: e.complemento || null,
          pais: e.pais || 'Brasil',
          principal: e.principal,
        }),
      ),
    );

    // LGPD
    if (v.lgpdTermos) {
      reqs.push(
        this.clientesService.createLgpd({
          clienteId,
          tipo: 1,
          aceito: true,
          data: new Date().toISOString(),
          canal: 'Web',
        }),
      );
    }
    if (v.lgpdMarketing) {
      reqs.push(
        this.clientesService.createLgpd({
          clienteId,
          tipo: 1,
          aceito: true,
          data: new Date().toISOString(),
          canal: 'Web',
        }),
      );
    }

    return reqs;
  }

  private onComplete(clienteId: number): void {
    this.saving = false;
    this.toast.success('Cliente salvo!', 'Cadastro realizado com sucesso.');
    this.router.navigate(['/clientes', clienteId]);
  }
}
