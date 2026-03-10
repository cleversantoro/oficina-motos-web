import { SlicePipe } from '@angular/common';
import { Component } from '@angular/core';

type Segmento = { label: string };
type Representante = { nome: string; cargo: string; contato: string; cor: string; acao: string };
type Endereco = { tipo: string; texto: string };
type Doc = { nome: string; status: 'ok' | 'alerta'; detalhe?: string; link?: string };

@Component({
  selector: 'app-fornecedor-detalhe',
  standalone: true,
  imports: [SlicePipe],
  templateUrl: './fornecedor-detalhe.html',
  styleUrl: './fornecedor-detalhe.scss',
})
export class FornecedorDetalhe {
  readonly fornecedor = {
    nome: 'Distribuidora AutoParts Sul',
    cnpj: '12.345.678/0001-90',
    score: 4.5,
    scoreLabel: 'Excelente entrega',
    pedidos: 23,
  };

  readonly segmentos: Segmento[] = [
    { label: 'Suspensao' },
    { label: 'Freios' },
    { label: 'Lubrificantes' },
  ];

  readonly representantes: Representante[] = [
    { nome: 'Roberto Carlos', cargo: 'Gerente de Contas (Região Sul)', contato: 'roberto@autoparts.com.br', cor: '#0ea5e9', acao: 'WhatsApp' },
    { nome: 'Central de Vendas', cargo: 'Televendas Geral', contato: '0800 777 9999', cor: '#64748b', acao: 'Ligar' },
  ];

  readonly enderecos: Endereco[] = [
    { tipo: 'Matriz', texto: 'Av. das Indústrias, 1000 - Galpão 4, São Paulo - SP' },
    { tipo: 'Centro Dist.', texto: 'Rod. Anhanguera, KM 20 - Cajamar - SP' },
  ];

  readonly documentos: Doc[] = [
    { nome: 'Contrato Social', status: 'ok', detalhe: 'Válido' },
    { nome: 'Certidão Negativa', status: 'alerta', detalhe: 'Vence hoje' },
    { nome: 'Certificação ISO 9001', status: 'ok', link: '#' },
  ];
}
