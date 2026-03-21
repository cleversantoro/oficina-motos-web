import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VeiculosService } from '../../../../core/services/veiculos.service';

type TabId = 'dados' | 'docs';

@Component({
  selector: 'app-veiculo-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './veiculo-detalhe.html',
  styleUrl: './veiculo-detalhe.scss',
})
export class VeiculoDetalhe implements OnInit {
  activeTab: TabId = 'dados';
  loading = false;
  error   = '';

  veiculo: any  = null;
  marcas:  any[] = [];
  modelos: any[] = [];

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private svc:    VeiculosService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID do veículo não informado.';
      return;
    }
    this.loadData(id);
  }

  private loadData(id: string): void {
    this.loading = true;
    this.error   = '';

    forkJoin({
      veiculo: this.svc.get(id),
      marcas:  this.svc.marcas(),
      modelos: this.svc.modelos(),
    }).subscribe({
      next: ({ veiculo, marcas, modelos }: any) => {
        this.veiculo  = veiculo;
        this.marcas   = Array.isArray(marcas)  ? marcas  : marcas?.data  ?? [];
        this.modelos  = Array.isArray(modelos) ? modelos : modelos?.data ?? [];
        this.loading  = false;
      },
      error: (err: any) => {
        this.error   = err?.error?.message ?? 'Erro ao carregar veículo.';
        this.loading = false;
      },
    });
  }

  get modeloObj(): any {
    return this.modelos.find(m => m.id === this.veiculo?.modeloId) ?? null;
  }

  get marcaObj(): any {
    return this.marcas.find(mk => mk.id === this.modeloObj?.marcaId) ?? null;
  }

  get displayName(): string {
    const marca  = this.marcaObj?.nome ?? '';
    const modelo = this.modeloObj?.nome ?? '';
    if (!marca && !modelo) return this.veiculo?.placa ?? '—';
    return [marca, modelo].filter(Boolean).join(' ');
  }

  get anoDisplay(): string {
    const fab = this.veiculo?.anoFab;
    const mod = this.veiculo?.anoMod;
    if (!fab) return '—';
    if (mod && mod !== fab) return `${fab}/${mod}`;
    return String(fab);
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/motos']);
  }
}
