import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdemServico } from '../../../../core/models';
import { OrdensService } from '../../../../core/services/ordens.service';

@Component({
  selector: 'app-os-detalhe',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './os-detalhe.html',
  styleUrl: './os-detalhe.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsDetalheComponent implements OnInit {
  readonly ordem = signal<OrdemServico | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ordensService: OrdensService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('Identificador de ordem inválido.');
      return;
    }

    this.loading.set(true);
    this.ordensService.get(id).subscribe({
      next: response => {
        this.ordem.set(response as OrdemServico);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar a ordem de serviço.');
        this.loading.set(false);
      },
    });
  }
}
