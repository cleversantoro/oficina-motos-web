import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { Mecanico } from '../../../../core/models';

@Component({
  selector: 'app-mecanico-detalhe',
  standalone: true,
  imports: [DatePipe, ButtonModule, TableModule, DialogModule, TabsModule],
  templateUrl: './mecanico-detalhe.html',
  styleUrl: './mecanico-detalhe.scss',
  providers: [MecanicosService]
})
export class MecanicoDetalhe implements OnInit {
  mecanicos: any[] = [];
  loading = false;
  selected: Mecanico | null = null;

  constructor(private mecanicosService: MecanicosService) {}

  ngOnInit(): void {
    this.fetchMecanicos();
  }

  fetchMecanicos() {
    this.loading = true;
    this.mecanicosService.list().subscribe({
      next: (resp: any) => { this.mecanicos = resp; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openDetails(item: any) {
    this.loading = true;
    this.mecanicosService.get(item.id).subscribe({
      next: (resp: any) => { this.selected = resp; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  closeDetails() { this.selected = null; }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  formatBoolean(value: any): string {
    if (value === true) return 'SIM';
    if (value === false) return 'NÃO';
    return '-';
  }
}
