// ============================================================
// ESTOQUE — interfaces de resposta e requisição
// Baseadas em EstoquePecaResponseDTO / EstoqueRequestDTO (backend)
// ============================================================

// ---- Response: sub-recursos ----

export interface EstoqueCategoria {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface EstoqueFabricante {
  id: number;
  nome: string;
  cnpj: string | null;
  contato: string | null;
}

export interface EstoqueLocalizacao {
  id: number;
  descricao: string;
  corredor: string | null;
  prateleira: string | null;
}

export interface EstoqueMovimentacao {
  id: number;
  pecaId: number;
  quantidade: number;
  tipo: string;
  referencia: string | null;
  dataMovimentacao: string;
  usuario: string | null;
}

export interface EstoquePecaAnexo {
  id: number;
  pecaId: number;
  nome: string | null;
  tipo: string | null;
  url: string | null;
  observacao: string | null;
  dataUpload: string | null;
}

export interface EstoquePecaFornecedor {
  id: number;
  pecaId: number;
  fornecedorId: number;
  preco: number | null;
  prazoEntrega: number | null;
  observacao: string | null;
}

export interface EstoquePecaHistorico {
  id: number;
  pecaId: number;
  dataAlteracao: string;
  usuario: string | null;
  campo: string | null;
  valorAntigo: string | null;
  valorNovo: string | null;
}

// ---- Response: entidade principal ----

export interface EstoquePeca {
  id: number;
  codigo: string;
  descricao: string;
  fabricanteId: number | null;
  categoriaId: number | null;
  localizacaoId: number | null;
  precoUnitario: number;
  quantidade: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  unidade: string;
  status: string;
  observacoes: string | null;
}

// ---- Requests ----

export interface CreateEstoqueCategoriaRequest {
  nome: string;
  descricao: string | null;
}
export type UpdateEstoqueCategoriaRequest = CreateEstoqueCategoriaRequest;

export interface CreateEstoqueFabricanteRequest {
  nome: string;
  cnpj: string | null;
  contato: string | null;
}
export type UpdateEstoqueFabricanteRequest = CreateEstoqueFabricanteRequest;

export interface CreateEstoqueLocalizacaoRequest {
  descricao: string;
  corredor: string | null;
  prateleira: string | null;
}
export type UpdateEstoqueLocalizacaoRequest = CreateEstoqueLocalizacaoRequest;

export interface CreateEstoquePecaRequest {
  codigo: string;
  descricao: string;
  fabricanteId: number | null;
  categoriaId: number | null;
  localizacaoId: number | null;
  precoUnitario: number;
  quantidade: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  unidade: string;
  status: string;
  observacoes: string | null;
}
export type UpdateEstoquePecaRequest = CreateEstoquePecaRequest;

export interface CreateEstoqueMovimentacaoRequest {
  pecaId: number;
  quantidade: number;
  tipo: string;
  referencia: string | null;
  usuario: string | null;
}
export type UpdateEstoqueMovimentacaoRequest = CreateEstoqueMovimentacaoRequest;

export interface CreateEstoquePecaAnexoRequest {
  pecaId: number;
  nome: string | null;
  tipo: string | null;
  url: string | null;
  observacao: string | null;
}
export type UpdateEstoquePecaAnexoRequest = CreateEstoquePecaAnexoRequest;

export interface CreateEstoquePecaFornecedorRequest {
  pecaId: number;
  fornecedorId: number;
  preco: number | null;
  prazoEntrega: number | null;
  observacao: string | null;
}
export type UpdateEstoquePecaFornecedorRequest = CreateEstoquePecaFornecedorRequest;

export interface CreateEstoquePecaHistoricoRequest {
  pecaId: number;
  dataAlteracao: string;
  usuario: string | null;
  campo: string | null;
  valorAntigo: string | null;
  valorNovo: string | null;
}
export type UpdateEstoquePecaHistoricoRequest = CreateEstoquePecaHistoricoRequest;
