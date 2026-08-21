import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/auth/auth.service';
import { canPerformPermission } from '../../../../core/auth/rbac-access.helper';
import { ClientesService } from '../../../../core/services/clientes.service';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { OrdensService } from '../../../../core/services/ordens.service';
import { VeiculosService } from '../../../../core/services/veiculos.service';
import { CreateOrdemServicoRequest } from '../../../../core/models';
import { Toast } from '../../../../shared/services/toast';

interface ClienteOpcao { id: number; nome?: string; nomeExibicao?: string; documento?: string; }
interface VeiculoOpcao { id: number; placa: string; modelo?: string; cor?: string; }
interface MecanicoOpcao { id: number; nome: string; sobrenome?: string; }

@Component({
  selector: 'app-os-novo',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule],
  templateUrl: './os-novo.html',
  styleUrl: './os-novo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsCadastroComponent implements OnInit {
  readonly clientes = signal<ClienteOpcao[]>([]);
  readonly veiculos = signal<VeiculoOpcao[]>([]);
  readonly mecanicos = signal<MecanicoOpcao[]>([]);
  readonly clienteTermo = signal('');
  readonly loadingClientes = signal(false);
  readonly loadingVeiculos = signal(false);
  readonly loadingMecanicos = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private clienteBuscaSequencia = 0;

  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.formBuilder.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    veiculoId: [0, [Validators.required, Validators.min(1)]],
    descricaoProblema: ['', [Validators.required, Validators.maxLength(500)]],
    mecanicoId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor(
    private readonly clientesService: ClientesService,
    private readonly veiculosService: VeiculosService,
    private readonly mecanicosService: MecanicosService,
    private readonly ordensService: OrdensService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toast: Toast,
  ) {}

  ngOnInit(): void {
    this.loadingMecanicos.set(true);
    this.mecanicosService.getAll<MecanicoOpcao[]>().subscribe({
      next: mecanicos => { this.mecanicos.set(mecanicos ?? []); this.loadingMecanicos.set(false); },
      error: () => { this.errorMessage.set('Não foi possível carregar os mecânicos.'); this.loadingMecanicos.set(false); },
    });
  }

  searchClientes(term: string): void {
    this.clienteTermo.set(term);
    if (term.trim().length < 2) { this.clientes.set([]); return; }
    const sequencia = ++this.clienteBuscaSequencia;
    this.loadingClientes.set(true);
    this.clientesService.search<ClienteOpcao[]>(term.trim()).subscribe({
      next: clientes => {
        if (sequencia !== this.clienteBuscaSequencia) return;
        this.clientes.set(clientes ?? []);
        this.loadingClientes.set(false);
      },
      error: () => {
        if (sequencia !== this.clienteBuscaSequencia) return;
        this.clientes.set([]);
        this.errorMessage.set('Não foi possível buscar clientes.');
        this.loadingClientes.set(false);
      },
    });
  }

  selectCliente(cliente: ClienteOpcao): void {
    this.form.controls.clienteId.setValue(cliente.id);
    this.form.controls.veiculoId.reset(0);
    this.veiculos.set([]);
    this.clienteTermo.set(this.displayCliente(cliente));
    this.loadingVeiculos.set(true);
    this.veiculosService.listByCliente<VeiculoOpcao[]>(cliente.id).subscribe({
      next: veiculos => { this.veiculos.set(veiculos ?? []); this.loadingVeiculos.set(false); },
      error: () => { this.errorMessage.set('Não foi possível carregar os veículos deste cliente.'); this.loadingVeiculos.set(false); },
    });
  }

  displayCliente(cliente: ClienteOpcao): string {
    return cliente.nomeExibicao || cliente.nome || cliente.documento || `Cliente #${cliente.id}`;
  }

  hasError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  canCreate(): boolean {
    return canPerformPermission(this.authService.permissions(), 'ordens', 'criar', this.authService.currentRole());
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.submitting() || this.form.invalid) return;
    if (!this.canCreate()) { this.denyAccess(); return; }

    const request: CreateOrdemServicoRequest = {
      ...this.form.getRawValue(), status: 'Aberta', dataAbertura: null, dataConclusao: null,
    };
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.ordensService.create<{ id: number }, CreateOrdemServicoRequest>(request).subscribe({
      next: response => {
        if (!Number.isInteger(response?.id) || response.id <= 0) {
          this.submitting.set(false); this.showError('A ordem foi criada sem um identificador válido.'); return;
        }
        void this.router.navigate(['/ordens', response.id]);
      },
      error: () => { this.submitting.set(false); this.showError('Não foi possível criar a ordem de serviço.'); },
    });
  }

  backToOrdens(): void {
    void this.router.navigate(['/ordens']);
  }

  private denyAccess(): void {
    this.toast.warn('Acesso negado', 'Você não tem permissão para acessar esta área.');
    void this.router.navigate(['/dashboard']);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    this.toast.error('Erro', message);
  }
}
