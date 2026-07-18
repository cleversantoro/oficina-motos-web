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
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { forkJoin } from 'rxjs';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Toast } from '../../../../shared/services/toast';
import { Confirmation } from '../../../../shared/services/confirmation';
import { FileUpload as FileUploadComponent } from '../../../../shared/ui/file-upload/file-upload';
import {
  cepValidator,
  celularValidator,
  cnpjValidator,
  cpfValidator,
} from '../../../../shared/validators';

type TabId = 'perfil' | 'contato' | 'financeiro' | 'legal' | 'anexos';

@Component({
  selector: 'app-cliente-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, FileUploadComponent],
  templateUrl: './cliente-editar.html',
  styleUrl: './cliente-editar.scss',
  providers: [ClientesService],
})
export class ClienteEditar implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private clientesService = inject(ClientesService);
  private toast = inject(Toast);
  private confirmation = inject(Confirmation);

  activeTab: TabId = 'perfil';
  loading = true;
  saving = false;
  saveError: string | null = null;
  clienteId = 0;
  cliente: any = null;
  cepLoading = new Set<number>();

  // Track deleted sub-entity IDs
  deletedEnderecoIds: number[] = [];
  deletedContatoIds: number[] = [];

  // IDs of existing PF, PJ, financeiro records
  pfId: number | null = null;
  pjId: number | null = null;
  financeiroId: number | null = null;

  readonly tabs: { id: TabId; label: string; desc: string }[] = [
    { id: 'perfil', label: 'Perfil & Identidade', desc: 'PF/PJ, status e origem' },
    { id: 'contato', label: 'Contato & Localizacao', desc: 'Telefones e enderecos' },
    { id: 'financeiro', label: 'Financeiro & Comercial', desc: 'Limite e pagamento' },
    { id: 'legal', label: 'Legal & Compliance', desc: 'LGPD' },
    { id: 'anexos', label: 'Arquivos', desc: 'Uploads e comprovantes' },
  ];

  form!: FormGroup;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/clientes']);
      return;
    }
    this.clienteId = +id;
    this.buildForm();
    this.loadCliente();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      tipo: ['pf'],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      nomeExibicao: [''],
      status: [1, Validators.required],
      vip: [false],
      observacoes: [''],
      origemId: [null],
      // PF
      cpf: ['', cpfValidator()],
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
      // Contato
      email: ['', Validators.email],
      telefone: ['', celularValidator()],
      contatos: this.fb.array([]),
      enderecos: this.fb.array([]),
      // Financeiro
      limiteCredito: [null],
      prazoPagamento: [null],
      bloqueado: [false],
      financeiroObservacoes: [''],
      // LGPD
      lgpdTermos: [false],
      lgpdMarketing: [false],
    });
  }

  private loadCliente(): void {
    this.loading = true;
    this.clientesService.get(this.clienteId).subscribe({
      next: (data: any) => {
        this.cliente = data;
        this.populateForm(data);
        this.loading = false;
      },
      error: () => {
        this.toast.error('Erro', 'Não foi possível carregar os dados do cliente.');
        this.loading = false;
      },
    });
  }

  private populateForm(c: any): void {
    const isPf = !!c.pessoaFisica;
    this.pfId = c.pessoaFisica?.id ?? null;
    this.pjId = c.pessoaJuridica?.id ?? null;
    this.financeiroId = c.financeiro?.id ?? null;

    this.form.patchValue({
      tipo: isPf ? 'pf' : 'pj',
      nome: c.nome || '',
      nomeExibicao: c.nomeExibicao || '',
      status: c.status ?? 1,
      vip: c.vip || false,
      observacoes: c.observacoes || '',
      origemId: c.origemId || null,
      email: c.email || '',
      telefone: c.telefone || '',
      // PF
      cpf: c.pessoaFisica?.cpf || '',
      rg: c.pessoaFisica?.rg || '',
      dataNascimento: c.pessoaFisica?.dataNascimento
        ? c.pessoaFisica.dataNascimento.substring(0, 10)
        : '',
      genero: c.pessoaFisica?.genero || '',
      estadoCivil: c.pessoaFisica?.estadoCivil || '',
      profissao: c.pessoaFisica?.profissao || '',
      // PJ
      cnpj: c.pessoaJuridica?.cnpj || '',
      razaoSocial: c.pessoaJuridica?.razaoSocial || '',
      nomeFantasia: c.pessoaJuridica?.nomeFantasia || '',
      inscricaoEstadual: c.pessoaJuridica?.inscricaoEstadual || '',
      inscricaoMunicipal: c.pessoaJuridica?.inscricaoMunicipal || '',
      responsavel: c.pessoaJuridica?.responsavel || '',
      // Financeiro
      limiteCredito: c.financeiro?.limiteCredito ?? null,
      prazoPagamento: c.financeiro?.prazoPagamento ?? null,
      bloqueado: c.financeiro?.bloqueado || false,
      financeiroObservacoes: c.financeiro?.observacoes || '',
    });

    // Endereços
    (c.enderecos || []).forEach((e: any) => {
      this.enderecos.push(this.makeEnderecoGroup(e));
    });

    // Contatos
    (c.contatos || []).forEach((ct: any) => {
      this.contatos.push(this.makeContatoGroup(ct));
    });
  }

  private makeEnderecoGroup(e: any = {}): FormGroup {
    return this.fb.group({
      id: [e.id ?? null],
      tipo: [e.tipo ?? 1, Validators.required],
      cep: [e.cep ?? '', [Validators.required, cepValidator()]],
      logradouro: [e.logradouro ?? '', Validators.required],
      numero: [e.numero ?? '', Validators.required],
      bairro: [e.bairro ?? '', Validators.required],
      cidade: [e.cidade ?? '', Validators.required],
      estado: [e.estado ?? '', [Validators.required, Validators.maxLength(2)]],
      complemento: [e.complemento ?? ''],
      pais: [e.pais ?? 'Brasil'],
      principal: [e.principal ?? false],
    });
  }

  private makeContatoGroup(c: any = {}): FormGroup {
    return this.fb.group({
      id: [c.id ?? null],
      tipo: [c.tipo ?? 1, Validators.required],
      valor: [c.valor ?? '', Validators.required],
      principal: [c.principal ?? false],
      observacao: [c.observacao ?? ''],
    });
  }

  // ── Getters ──────────────────────────────────────────────────────────────────

  get isPessoaFisica(): boolean {
    return this.form.get('tipo')?.value === 'pf';
  }

  get contatos(): FormArray {
    return this.form.get('contatos') as FormArray;
  }

  get enderecos(): FormArray {
    return this.form.get('enderecos') as FormArray;
  }

  // ── Tab navigation ───────────────────────────────────────────────────────────

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  onTabSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value as TabId | undefined;
    if (value) this.setTab(value);
  }

  setTipo(tipo: 'pf' | 'pj'): void {
    this.form.patchValue({ tipo });
    if (tipo === 'pf') this.form.patchValue({ cnpj: '', razaoSocial: '' });
    else this.form.patchValue({ cpf: '', rg: '' });
  }

  // ── FormArray helpers ────────────────────────────────────────────────────────

  addContato(): void {
    this.contatos.push(this.makeContatoGroup());
  }

  removeContato(i: number): void {
    const group = this.contatos.at(i) as FormGroup;
    const id = group.get('id')?.value;
    if (id) this.deletedContatoIds.push(id);
    this.contatos.removeAt(i);
  }

  addEndereco(): void {
    this.enderecos.push(this.makeEnderecoGroup());
  }

  removeEndereco(i: number): void {
    const group = this.enderecos.at(i) as FormGroup;
    const id = group.get('id')?.value;
    if (id) this.deletedEnderecoIds.push(id);
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
        if (v.length === 11) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (v.length === 10) v = v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '($1) $2');
        break;
    }

    input.value = v;
    ctrl.setValue(v, { emitEvent: false });
    ctrl.markAsDirty();
  }

  // ── CEP auto-search ──────────────────────────────────────────────────────────

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

  // ── Validation helpers ───────────────────────────────────────────────────────

  isInvalid(ctrl: AbstractControl | null): boolean {
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  field(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  async onSave(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.setTab('perfil');
      this.saveError = 'Corrija os campos destacados antes de salvar.';
      return;
    }

    const v = this.form.value;
    this.saving = true;
    this.saveError = null;

    this.clientesService.update(this.clienteId, {
      nome: v.nome,
      nomeExibicao: v.nomeExibicao || null,
      email: v.email || '',
      telefone: v.telefone || '',
      status: v.status,
      vip: v.vip || false,
      observacoes: v.observacoes || null,
      origemId: v.origemId || null,
    }).subscribe({
      next: () => this.runSubUpdates(v),
      error: (err: any) => {
        this.saving = false;
        this.saveError = err?.error?.message ?? 'Erro ao salvar cliente.';
      },
    });
  }

  private runSubUpdates(v: any): void {
    const reqs: any[] = [];

    // Delete removed endereços and contatos
    this.deletedEnderecoIds.forEach((id) =>
      reqs.push(this.clientesService.deleteEndereco(id)));
    this.deletedContatoIds.forEach((id) =>
      reqs.push(this.clientesService.deleteContato(id)));

    // PF
    if (this.isPessoaFisica) {
      const pf = {
        clienteId: this.clienteId,
        cpf: v.cpf || null,
        rg: v.rg || null,
        dataNascimento: v.dataNascimento || null,
        genero: v.genero || null,
        estadoCivil: v.estadoCivil || null,
        profissao: v.profissao || null,
      };
      reqs.push(this.pfId
        ? this.clientesService.updatePf(this.pfId, pf)
        : this.clientesService.createPf(pf));
    }

    // PJ
    if (!this.isPessoaFisica) {
      const pj = {
        clienteId: this.clienteId,
        cnpj: v.cnpj || null,
        razaoSocial: v.razaoSocial || null,
        nomeFantasia: v.nomeFantasia || null,
        inscricaoEstadual: v.inscricaoEstadual || null,
        inscricaoMunicipal: v.inscricaoMunicipal || null,
        responsavel: v.responsavel || null,
      };
      reqs.push(this.pjId
        ? this.clientesService.updatePj(this.pjId, pj)
        : this.clientesService.createPj(pj));
    }

    // Financeiro
    if (v.limiteCredito || v.prazoPagamento) {
      const fin = {
        clienteId: this.clienteId,
        limiteCredito: v.limiteCredito ?? null,
        prazoPagamento: v.prazoPagamento ?? null,
        bloqueado: v.bloqueado ?? false,
        observacoes: v.financeiroObservacoes || null,
      };
      reqs.push(this.financeiroId
        ? this.clientesService.updateFinanceiro(this.financeiroId, fin)
        : this.clientesService.createFinanceiro(fin));
    }

    // Endereços
    (v.enderecos as any[]).forEach((e) => {
      const body = {
        clienteId: this.clienteId,
        tipo: e.tipo, cep: e.cep, logradouro: e.logradouro,
        numero: e.numero, bairro: e.bairro, cidade: e.cidade,
        estado: e.estado, complemento: e.complemento || null,
        pais: e.pais || 'Brasil', principal: e.principal,
      };
      reqs.push(e.id
        ? this.clientesService.updateEndereco(e.id, body)
        : this.clientesService.createEndereco(body));
    });

    // Contatos
    (v.contatos as any[]).forEach((c) => {
      const body = {
        clienteId: this.clienteId,
        tipo: c.tipo, valor: c.valor,
        principal: c.principal, observacao: c.observacao || null,
      };
      reqs.push(c.id
        ? this.clientesService.updateContato(c.id, body)
        : this.clientesService.createContato(body));
    });

    if (reqs.length === 0) {
      this.onComplete();
      return;
    }

    forkJoin(reqs).subscribe({
      next: () => this.onComplete(),
      error: (err: any) => {
        this.saving = false;
        this.saveError = err?.error?.message ?? 'Erro ao salvar dados adicionais.';
      },
    });
  }

  private onComplete(): void {
    this.saving = false;
    this.deletedEnderecoIds = [];
    this.deletedContatoIds = [];
    this.toast.success('Alterações salvas!', 'Os dados do cliente foram atualizados.');
    this.router.navigate(['/clientes', this.clienteId]);
  }

  async cancelar(): Promise<void> {
    this.router.navigate(['/clientes', this.clienteId]);
  }
}
