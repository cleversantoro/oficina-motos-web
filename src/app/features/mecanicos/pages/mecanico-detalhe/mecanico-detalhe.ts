import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Optional, Output, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { Mecanico } from '../../../../core/models';
import { MecanicosService } from '../../../../core/services/mecanicos.service';

@Component({
  selector: 'app-mecanico-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, DialogModule, TabsModule],
  templateUrl: './mecanico-detalhe.html',
  styleUrl: './mecanico-detalhe.scss',
})
export class MecanicoDetalhe implements OnInit {
  private route = inject(ActivatedRoute, { optional: true });
  private router = inject(Router, { optional: true });
  private mecanicosService = inject(MecanicosService, { optional: true });

  @Input() mecanico: Mecanico | null = null;
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  isRoutedPage = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    const idParam = this.route?.snapshot?.paramMap?.get('id');
    const hasRouteConfig = this.route?.snapshot?.routeConfig?.path?.includes(':id') ?? false;

    if (idParam !== null && idParam !== undefined || hasRouteConfig) {
      this.isRoutedPage = true;
      const numericId = Number(idParam);
      if (!idParam || Number.isNaN(numericId) || numericId <= 0) {
        this.error = 'ID do mecânico inválido.';
        this.loading = false;
        return;
      }
      this.loadMecanico(numericId);
    }
  }

  loadMecanico(id: number): void {
    if (!this.mecanicosService) {
      this.error = 'Serviço de mecânicos indisponível.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.mecanicosService.get(id).subscribe({
      next: (resp: any) => {
        this.mecanico = resp;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Mecânico não encontrado.';
        this.loading = false;
      },
    });
  }

  close(): void {
    this.closed.emit();
    if (this.isRoutedPage) {
      this.voltar();
    }
  }

  voltar(): void {
    this.router?.navigate(['/mecanicos']);
  }

  get initials(): string {
    if (!this.mecanico?.nome) return '?';
    const s = this.mecanico.sobrenome?.[0] ?? '';
    return (this.mecanico.nome[0] + s).toUpperCase();
  }

  get isAtivo(): boolean {
    return this.mecanico?.status?.toLowerCase() === 'ativo';
  }

  get primaryContact(): string {
    const c = this.mecanico?.contatos?.find(ct => ct.principal);
    return c?.valor ?? '-';
  }

  get primaryCity(): string {
    const e = this.mecanico?.enderecos?.find(en => en.principal);
    return e ? `${e.cidade}, ${e.estado}` : '-';
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR');
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  diaSemanaLabel(dia: number): string {
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dia] ?? String(dia);
  }
}

export { MecanicoDetalhe as MecanicoDetalheComponent };
