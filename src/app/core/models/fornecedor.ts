// ============================================================
// FORNECEDOR — interfaces de resposta e requisição
// Baseadas em FornecedorResponseDTO / FornecedorRequestDTO (backend)
// ============================================================

// ---- Response: sub-recursos ----

export interface FornecedorSegmento {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export interface FornecedorSegmentoRel {
  id: number;
  fornecedorId: number;
  segmentoId: number;
  principal: boolean;
  observacoes: string | null;
}

export interface FornecedorEndereco {
  id: number;
  fornecedorId: number;
  tipo: string;
  cep: string | null;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string | null;
  complemento: string | null;
  principal: boolean;
  observacao: string | null;
}

export interface FornecedorContato {
  id: number;
  fornecedorId: number;
  tipo: string;
  valor: string;
  principal: boolean;
  observacao: string | null;
}

export interface FornecedorRepresentante {
  id: number;
  fornecedorId: number;
  nome: string;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  preferenciaContato: string | null;
  principal: boolean;
  observacoes: string | null;
}

export interface FornecedorBanco {
  id: number;
  fornecedorId: number;
  banco: string;
  agencia: string | null;
  conta: string | null;
  digito: string | null;
  tipoConta: string | null;
  pixChave: string | null;
  observacoes: string | null;
  principal: boolean;
}

export interface FornecedorDocumento {
  id: number;
  fornecedorId: number;
  tipo: string;
  numero: string;
  dataEmissao: string | null;
  dataValidade: string | null;
  orgaoExpedidor: string | null;
  arquivoUrl: string | null;
  observacoes: string | null;
}

export interface FornecedorCertificacao {
  id: number;
  fornecedorId: number;
  titulo: string;
  instituicao: string | null;
  dataEmissao: string | null;
  dataValidade: string | null;
  codigoCertificacao: string | null;
  escopo: string | null;
}

export interface FornecedorAvaliacao {
  id: number;
  fornecedorId: number;
  dataAvaliacao: string;
  avaliadoPor: string | null;
  categoria: string | null;
  nota: number;
  comentarios: string | null;
}

// ---- Response: entidade principal ----

export interface Fornecedor {
  id: number;
  codigo: string;
  tipo: string;
  razaoSocial: string;
  nomeFantasia: string;
  documento: string;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  segmentoPrincipalId: number | null;
  website: string | null;
  email: string | null;
  telefonePrincipal: string | null;
  status: string;
  condicaoPagamentoPadrao: string | null;
  prazoEntregaMedio: number | null;
  notaMedia: number | null;
  observacoes: string | null;
  prazoGarantiaPadrao: string | null;
  termosNegociados: string | null;
  atendimentoPersonalizado: boolean;
  retiradaLocal: boolean;
  ratingLogistica: number | null;
  ratingQualidade: number | null;
}

// ---- Requests ----

export interface CreateFornecedorSegmentoRequest {
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}
export type UpdateFornecedorSegmentoRequest = CreateFornecedorSegmentoRequest;

export interface CreateFornecedorEnderecoRequest {
  fornecedorId: number;
  tipo: string;
  cep: string | null;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string | null;
  complemento: string | null;
  principal: boolean;
  observacao: string | null;
}
export type UpdateFornecedorEnderecoRequest = CreateFornecedorEnderecoRequest;

export interface CreateFornecedorContatoRequest {
  fornecedorId: number;
  tipo: string;
  valor: string;
  principal: boolean;
  observacao: string | null;
}
export type UpdateFornecedorContatoRequest = CreateFornecedorContatoRequest;

export interface CreateFornecedorRepresentanteRequest {
  fornecedorId: number;
  nome: string;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  preferenciaContato: string | null;
  principal: boolean;
  observacoes: string | null;
}
export type UpdateFornecedorRepresentanteRequest = CreateFornecedorRepresentanteRequest;

export interface CreateFornecedorBancoRequest {
  fornecedorId: number;
  banco: string;
  agencia: string | null;
  conta: string | null;
  digito: string | null;
  tipoConta: string | null;
  pixChave: string | null;
  observacoes: string | null;
  principal: boolean;
}
export type UpdateFornecedorBancoRequest = CreateFornecedorBancoRequest;

export interface CreateFornecedorDocumentoRequest {
  fornecedorId: number;
  tipo: string;
  numero: string;
  dataEmissao: string | null;
  dataValidade: string | null;
  orgaoExpedidor: string | null;
  arquivoUrl: string | null;
  observacoes: string | null;
}
export type UpdateFornecedorDocumentoRequest = CreateFornecedorDocumentoRequest;

export interface CreateFornecedorCertificacaoRequest {
  fornecedorId: number;
  titulo: string;
  instituicao: string | null;
  dataEmissao: string | null;
  dataValidade: string | null;
  codigoCertificacao: string | null;
  escopo: string | null;
}
export type UpdateFornecedorCertificacaoRequest = CreateFornecedorCertificacaoRequest;

export interface CreateFornecedorAvaliacaoRequest {
  fornecedorId: number;
  dataAvaliacao: string;
  avaliadoPor: string | null;
  categoria: string | null;
  nota: number;
  comentarios: string | null;
}
export type UpdateFornecedorAvaliacaoRequest = CreateFornecedorAvaliacaoRequest;
