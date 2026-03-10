import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { OrdensService } from '../../../../core/services/ordens.service';
import { OrdemServico } from '../../../../core/models';

@Component({
  selector: 'app-os-detalhe',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ButtonModule, TableModule, DialogModule, TabsModule],
  templateUrl: './os-detalhe.html',
  styleUrl: './os-detalhe.scss',
  providers: [OrdensService]
})
export class OsDetalhe implements OnInit {
  ordens: any[] = [];
  loading = false;
  selected: OrdemServico | null = null;

  constructor(private ordensService: OrdensService) {}

  ngOnInit(): void {
    this.fetchOrdens();
  }

  fetchOrdens() {
    this.loading = true;
    this.ordensService.list().subscribe({
      next: (resp: any) => { this.ordens = resp; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openDetails(item: any) {
    this.loading = true;
    this.ordensService.get(item.id).subscribe({
      next: (resp: any) => { this.selected = resp; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  closeDetails() { this.selected = null; }

  totalItens(os: OrdemServico): number {
    return os.itens?.reduce((s, i) => s + i.total, 0) ?? 0;
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }
}
