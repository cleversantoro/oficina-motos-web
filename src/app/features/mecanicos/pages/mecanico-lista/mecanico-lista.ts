import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { Mecanico } from '../../../../core/models';
import { MecanicoDetalhe } from '../mecanico-detalhe/mecanico-detalhe';

@Component({
  selector: 'app-mecanico-lista',
  standalone: true,
  imports: [ButtonModule, TableModule, MecanicoDetalhe],
  templateUrl: './mecanico-lista.html',
  styleUrl: './mecanico-lista.scss',
  providers: [MecanicosService]
})
export class MecanicoLista implements OnInit {
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
}
