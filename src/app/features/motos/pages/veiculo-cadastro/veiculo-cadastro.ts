import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  CreateVeiculoRequest,
  VeiculoMarca,
  VeiculoModelo,
} from '../../../../core/models';
import { ClientesService } from '../../../../core/services/clientes.service';
import { VeiculosService } from '../../../../core/services/veiculos.service';
import { Toast } from '../../../../shared/services/toast';
import { cleanPlaca, placaValidator } from '../../../../shared/validators';

export interface ClienteOpcao {
  id: number;
  nome?: string;
  nomeExibicao?: string;
  documento?: string;
}

@Component({
  selector: 'app-veiculo-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule],
  templateUrl: './veiculo-cadastro.html',
  styleUrl: './veiculo-cadastro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VeiculoCadastroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly veiculosService = inject(VeiculosService);
  private readonly clientesService = inject(ClientesService);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  // Estados reativos (Signals)
  readonly marcas = signal<VeiculoMarca[]>([]);
  readonly todosModelos = signal<VeiculoModelo[]>([]);
  readonly modelosFiltrados = signal<VeiculoModelo[]>([]);
  readonly sugestoesClientes = signal<ClienteOpcao[]>([]);
  readonly clienteTermo = signal<string>('');
  readonly clienteSelecionado = signal<ClienteOpcao | null>(null);

  readonly loadingMarcas = signal<boolean>(false);
  readonly loadingModelos = signal<boolean>(false);
  readonly loadingClientes = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  private clienteBuscaSequencia = 0;

  // Ano limite dinâmico
  readonly anoMaximo = new Date().getFullYear() + 2;

  // Formulário Reativo
  readonly form = this.fb.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    placa: ['', [Validators.required, placaValidator()]],
    marcaId: [0, [Validators.required, Validators.min(1)]],
    modeloId: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
    anoFab: [null as number | null, [Validators.min(1950), Validators.max(new Date().getFullYear() + 1)]],
    anoMod: [null as number | null, [Validators.min(1950), Validators.max(this.anoMaximo)]],
    cor: ['', [Validators.maxLength(40)]],
    chassi: ['', [Validators.maxLength(17)]],
    renavam: ['', [Validators.maxLength(20)]],
    km: ['', [Validators.min(0)]],
    combustivel: ['Gasolina'],
    observacao: ['', [Validators.maxLength(500)]],
    principal: [false],
    ativo: [true],
  });

  ngOnInit(): void {
    this.carregarMarcasEModelos();
  }

  carregarMarcasEModelos(): void {
    this.loadingMarcas.set(true);
    this.veiculosService.marcas().subscribe({
      next: (res: any) => {
        const listaMarcas: VeiculoMarca[] = Array.isArray(res) ? res : res?.data ?? [];
        this.marcas.set(listaMarcas);
        this.loadingMarcas.set(false);
      },
      error: () => {
        this.toast.error('Erro ao carregar marcas', 'Não foi possível buscar as marcas de veículos.');
        this.loadingMarcas.set(false);
      },
    });

    this.loadingModelos.set(true);
    this.veiculosService.modelos().subscribe({
      next: (res: any) => {
        const listaModelos: VeiculoModelo[] = Array.isArray(res) ? res : res?.data ?? [];
        this.todosModelos.set(listaModelos);
        this.loadingModelos.set(false);
      },
      error: () => {
        this.loadingModelos.set(false);
      },
    });
  }

  // Tratamento da Placa (Caixa Alta automática)
  onPlacaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.form.controls.placa.setValue(upper, { emitEvent: false });
  }

  // Tratamento do Chassi (Caixa Alta automática)
  onChassiInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.form.controls.chassi.setValue(upper, { emitEvent: false });
  }

  // Autocomplete de Clientes
  searchClientes(term: string): void {
    this.clienteTermo.set(term);
    const termoLimpo = term.trim();

    if (termoLimpo.length < 2) {
      this.sugestoesClientes.set([]);
      return;
    }

    const sequencia = ++this.clienteBuscaSequencia;
    this.loadingClientes.set(true);

    this.clientesService.search<ClienteOpcao[]>(termoLimpo).subscribe({
      next: (clientes) => {
        if (sequencia !== this.clienteBuscaSequencia) return;
        this.sugestoesClientes.set(clientes ?? []);
        this.loadingClientes.set(false);
      },
      error: () => {
        if (sequencia !== this.clienteBuscaSequencia) return;
        this.sugestoesClientes.set([]);
        this.loadingClientes.set(false);
      },
    });
  }

  selectCliente(cliente: ClienteOpcao): void {
    this.form.controls.clienteId.setValue(cliente.id);
    this.clienteSelecionado.set(cliente);
    this.clienteTermo.set(this.displayCliente(cliente));
    this.sugestoesClientes.set([]);
  }

  clearCliente(): void {
    this.form.controls.clienteId.setValue(0);
    this.clienteSelecionado.set(null);
    this.clienteTermo.set('');
    this.sugestoesClientes.set([]);
  }

  displayCliente(cliente: ClienteOpcao): string {
    const nome = cliente.nomeExibicao || cliente.nome || `Cliente #${cliente.id}`;
    return cliente.documento ? `${nome} (${cliente.documento})` : nome;
  }

  // Cascata Marca -> Modelo
  onMarcaChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const marcaId = Number(target.value) || 0;

    this.form.controls.marcaId.setValue(marcaId);
    this.form.controls.modeloId.setValue(0);

    if (marcaId > 0) {
      const modelos = this.todosModelos().filter((m) => m.marcaId === marcaId);
      this.modelosFiltrados.set(modelos);
      this.form.controls.modeloId.enable();
    } else {
      this.modelosFiltrados.set([]);
      this.form.controls.modeloId.disable();
    }
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
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

    const payload: CreateVeiculoRequest = {
      clienteId: Number(fv.clienteId),
      placa: cleanPlaca(fv.placa),
      modeloId: Number(fv.modeloId) > 0 ? Number(fv.modeloId) : null,
      anoFab: fv.anoFab ? Number(fv.anoFab) : null,
      anoMod: fv.anoMod ? Number(fv.anoMod) : null,
      cor: fv.cor ? fv.cor.trim() : null,
      chassi: fv.chassi ? fv.chassi.trim() : null,
      renavam: fv.renavam ? fv.renavam.trim() : null,
      km: fv.km !== null && fv.km !== undefined && String(fv.km).trim() !== '' ? String(fv.km) : null,
      combustivel: fv.combustivel ? String(fv.combustivel) : null,
      observacao: fv.observacao ? fv.observacao.trim() : null,
      principal: !!fv.principal,
      ativo: fv.ativo ?? true,
    };

    this.veiculosService.create(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success(
          'Veículo cadastrado',
          `Motocicleta de placa "${payload.placa}" cadastrada com sucesso!`
        );
        this.router.navigate(['/motos']);
      },
      error: (err: any) => {
        this.submitting.set(false);
        const msg =
          err?.error?.message ||
          'Não foi possível cadastrar o veículo. Verifique se a placa já não está cadastrada.';
        this.toast.error('Erro ao cadastrar', msg);
      },
    });
  }
}

