import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../core/services/clientes.service';

type TabId = 'perfil' | 'contato' | 'financeiro' | 'legal' | 'anexos';

@Component({
  selector: 'app-cliente-cadastro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './cliente-cadastro.html',
  styleUrl: './cliente-cadastro.scss',
})
export class ClienteCadastro implements OnInit {
  activeTab: TabId = 'perfil';
  saving = false;
  saveError: string | null = null;
  saveSuccess = false;

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
      cpf: ['', Validators.required],
      rg: [''],
      dataNascimento: [''],
      genero: [''],
      estadoCivil: [''],
      profissao: [''],

      // PJ
      cnpj: [''],
      razaoSocial: [''],
      nomeFantasia: [''],
      inscricaoEstadual: [''],
      inscricaoMunicipal: [''],
      responsavel: [''],

      // ── Contato ─────────────────────────────────────────────
      email: ['', Validators.email],
      telefone: [''],
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
        cep: ['', Validators.required],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        estado: ['', Validators.required],
        complemento: [''],
        pais: ['Brasil'],
        principal: [false],
      }),
    );
  }

  removeEndereco(i: number): void {
    this.enderecos.removeAt(i);
  }

  isInvalid(ctrl: AbstractControl | null): boolean {
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  field(name: string): AbstractControl | null {
    return this.form.get(name);
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
    this.saveSuccess = true;
    this.router.navigate(['/clientes']);
  }
}
