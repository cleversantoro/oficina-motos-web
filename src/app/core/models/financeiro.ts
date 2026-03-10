// ============================================================
// FINANCEIRO — interfaces de resposta e requisição
// Baseadas em FinanceiroResponseDTO / FinanceiroRequestDTO (backend)
// ============================================================

// ---- Response ----

export interface FinanceiroMetodoPagamento {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface FinanceiroPagamento {
  id: number;
  ordemServicoId: number | null;
  clienteId: number | null;
  fornecedorId: number | null;
  valor: number;
  status: string;
  dataPagamento: string | null;
  metodoId: number | null;
  observacao: string | null;
}

export interface FinanceiroAnexo {
  id: number;
  pagamentoId: number | null;
  contaPagarId: number | null;
  contaReceberId: number | null;
  nome: string | null;
  tipo: string | null;
  url: string | null;
  observacao: string | null;
  dataUpload: string | null;
}

export interface FinanceiroContaPagar {
  id: number;
  fornecedorId: number | null;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  dataPagamento: string | null;
  metodoId: number | null;
  observacao: string | null;
}

export interface FinanceiroContaReceber {
  id: number;
  clienteId: number | null;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  dataRecebimento: string | null;
  metodoId: number | null;
  observacao: string | null;
}

export interface FinanceiroHistorico {
  id: number;
  entidade: string;
  entidadeId: number;
  dataAlteracao: string;
  usuario: string | null;
  campo: string | null;
  valorAntigo: string | null;
  valorNovo: string | null;
}

export interface FinanceiroLancamento {
  id: number;
  tipo: string;
  descricao: string;
  valor: number;
  dataLancamento: string;
  referencia: string | null;
  observacao: string | null;
}

// ---- Requests ----

export interface CreateFinanceiroMetodoPagamentoRequest {
  nome: string;
  descricao: string | null;
}
export type UpdateFinanceiroMetodoPagamentoRequest = CreateFinanceiroMetodoPagamentoRequest;

export interface CreateFinanceiroPagamentoRequest {
  ordemServicoId: number | null;
  clienteId: number | null;
  fornecedorId: number | null;
  valor: number;
  status: string;
  dataPagamento: string | null;
  metodoId: number | null;
  observacao: string | null;
}
export type UpdateFinanceiroPagamentoRequest = CreateFinanceiroPagamentoRequest;

export interface CreateFinanceiroAnexoRequest {
  pagamentoId: number | null;
  contaPagarId: number | null;
  contaReceberId: number | null;
  nome: string | null;
  tipo: string | null;
  url: string | null;
  observacao: string | null;
  dataUpload: string | null;
}
export type UpdateFinanceiroAnexoRequest = CreateFinanceiroAnexoRequest;

export interface CreateFinanceiroContaPagarRequest {
  fornecedorId: number | null;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  dataPagamento: string | null;
  metodoId: number | null;
  observacao: string | null;
}
export type UpdateFinanceiroContaPagarRequest = CreateFinanceiroContaPagarRequest;

export interface CreateFinanceiroContaReceberRequest {
  clienteId: number | null;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  dataRecebimento: string | null;
  metodoId: number | null;
  observacao: string | null;
}
export type UpdateFinanceiroContaReceberRequest = CreateFinanceiroContaReceberRequest;

export interface CreateFinanceiroHistoricoRequest {
  entidade: string;
  entidadeId: number;
  dataAlteracao: string;
  usuario: string | null;
  campo: string | null;
  valorAntigo: string | null;
  valorNovo: string | null;
}
export type UpdateFinanceiroHistoricoRequest = CreateFinanceiroHistoricoRequest;

export interface CreateFinanceiroLancamentoRequest {
  tipo: string;
  descricao: string;
  valor: number;
  dataLancamento: string;
  referencia: string | null;
  observacao: string | null;
}
export type UpdateFinanceiroLancamentoRequest = CreateFinanceiroLancamentoRequest;
