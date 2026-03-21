import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import {
  Fornecedor,
  FornecedorAvaliacao,
  FornecedorBanco,
  FornecedorCertificacao,
  FornecedorDocumento,
  FornecedorEndereco,
  FornecedorRepresentante,
  FornecedorSegmento,
} from '../../../../core/models/fornecedor';

@Component({
  selector: 'app-fornecedor-detalhe',
  standalone: true,
  imports: [CommonModule, SlicePipe, DatePipe, RouterLink],
  templateUrl: './fornecedor-detalhe.html',
  styleUrl: './fornecedor-detalhe.scss',
})
export class FornecedorDetalhe implements OnInit {
  loading = true;
  error: string | null = null;

  fornecedor: Fornecedor | null = null;
  representantes: FornecedorRepresentante[] = [];
  enderecos: FornecedorEndereco[] = [];
  bancos: FornecedorBanco[] = [];
  documentos: FornecedorDocumento[] = [];
  certificacoes: FornecedorCertificacao[] = [];
  avaliacoes: FornecedorAvaliacao[] = [];
  todosSegmentos: FornecedorSegmento[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: FornecedoresService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/fornecedores']);
      return;
    }
    this.loadData(+id);
  }

  private loadData(id: number): void {
    this.loading = true;
    forkJoin({
      fornecedor: this.svc.get(id),
      representantes: this.svc.representantes({ fornecedorId: id }),
      enderecos: this.svc.enderecos({ fornecedorId: id }),
      bancos: this.svc.bancos({ fornecedorId: id }),
      documentos: this.svc.documentos({ fornecedorId: id }),
      certificacoes: this.svc.certificacoes({ fornecedorId: id }),
      avaliacoes: this.svc.avaliacoes({ fornecedorId: id }),
      todosSegmentos: this.svc.segmentos(),
    }).subscribe({
      next: (data: any) => {
        this.fornecedor = data.fornecedor as Fornecedor;
        this.representantes = (data.representantes as FornecedorRepresentante[]) ?? [];
        this.enderecos = (data.enderecos as FornecedorEndereco[]) ?? [];
        this.bancos = (data.bancos as FornecedorBanco[]) ?? [];
        this.documentos = (data.documentos as FornecedorDocumento[]) ?? [];
        this.certificacoes = (data.certificacoes as FornecedorCertificacao[]) ?? [];
        this.avaliacoes = (data.avaliacoes as FornecedorAvaliacao[]) ?? [];
        this.todosSegmentos = (data.todosSegmentos as FornecedorSegmento[]) ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message ?? 'Erro ao carregar fornecedor.';
        this.loading = false;
      },
    });
  }

  get displayName(): string {
    return this.fornecedor?.nomeFantasia || this.fornecedor?.razaoSocial || '';
  }

  get segmentoPrincipalNome(): string | null {
    if (!this.fornecedor?.segmentoPrincipalId) return null;
    return (
      this.todosSegmentos.find((s) => s.id === this.fornecedor!.segmentoPrincipalId)?.nome ?? null
    );
  }

  get bancoPrincipal(): FornecedorBanco | null {
    return this.bancos.find((b) => b.principal) ?? this.bancos[0] ?? null;
  }

  get scoreLabel(): string {
    const n = this.fornecedor?.notaMedia ?? 0;
    if (n >= 4.5) return 'Excelente';
    if (n >= 3.5) return 'Bom';
    if (n >= 2.5) return 'Regular';
    return 'Abaixo da média';
  }

  starsOf(nota: number | null): string {
    const n = Math.max(0, Math.min(5, Math.round(nota ?? 0)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  avatarColor(nome: string): string {
    const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  docValidity(dataValidade: string | null): 'ok' | 'vencendo' | 'vencido' | 'sem-data' {
    if (!dataValidade) return 'sem-data';
    const diff = new Date(dataValidade).getTime() - Date.now();
    if (diff < 0) return 'vencido';
    if (diff < 30 * 24 * 60 * 60 * 1000) return 'vencendo';
    return 'ok';
  }
}
