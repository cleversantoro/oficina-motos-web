import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { Mecanico } from '../../../../core/models';

@Component({
  selector: 'app-mecanico-detalhe',
  standalone: true,
  imports: [ButtonModule, DialogModule, TabsModule],
  templateUrl: './mecanico-detalhe.html',
  styleUrl: './mecanico-detalhe.scss',
})
export class MecanicoDetalhe {
  @Input() mecanico: Mecanico | null = null;
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

  get initials(): string {
    if (!this.mecanico) return '?';
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
