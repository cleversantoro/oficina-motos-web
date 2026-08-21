// ============================================================
// ORDEM DE SERVIÇO — interfaces de resposta e requisição
// Baseadas em OrdemServicoResponseDTO / OrdemServicoRequestDTO (backend)
// ============================================================

// ---- Response: sub-recursos ----

export interface OrdemServicoAnexo {
  id: number;
  ordemServicoId: number;
  nome: string | null;
  tipo: string | null;
  url: string | null;
  observacao: string | null;
  dataUpload: string | null;
}

export interface OrdemServicoAvaliacao {
  id: number;
  ordemServicoId: number;
  nota: number;
  comentario: string | null;
  usuario: string | null;
}

export interface OrdemServicoChecklist {
  id: number;
  ordemServicoId: number;
  item: string;
  realizado: boolean;
  observacao: string | null;
}

export interface OrdemServicoItem {
  id: number;
  ordemServicoId: number;
  pecaId: number | null;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

export interface OrdemServicoObservacao {
  id: number;
  ordemServicoId: number;
  usuario: string | null;
  texto: string;
}

export interface OrdemServicoHistorico {
  id: number;
  ordemServicoId: number;
  dataAlteracao: string;
  usuario: string | null;
  campo: string | null;
  valorAntigo: string | null;
  valorNovo: string | null;
}

export interface OrdemServicoPagamento {
  id: number;
  ordemServicoId: number;
  valor: number;
  status: string;
  dataPagamento: string | null;
  metodo: string | null;
  observacao: string | null;
}

// ---- Response: entidade principal ----

export interface OrdemServico {
  id: number;
  clienteId: number;
  mecanicoId: number;
  descricaoProblema: string;
  status: string;
  dataAbertura: string;
  dataConclusao: string | null;
  anexos: OrdemServicoAnexo[];
  avaliacoes: OrdemServicoAvaliacao[];
  checklists: OrdemServicoChecklist[];
  itens: OrdemServicoItem[];
  observacoes: OrdemServicoObservacao[];
  historico: OrdemServicoHistorico[];
  pagamentos: OrdemServicoPagamento[];
}

// ---- Requests ----

export interface CreateOrdemServicoRequest {
  clienteId: number;
  veiculoId: number;
  mecanicoId: number;
  descricaoProblema: string;
  status: string;
  dataAbertura: string | null;
  dataConclusao: string | null;
}
export type UpdateOrdemServicoRequest = CreateOrdemServicoRequest;

export interface CreateOrdemServicoAnexoRequest {
  ordemServicoId: number;
  nome: string | null;
  tipo: string | null;
  url: string | null;
  observacao: string | null;
}
export type UpdateOrdemServicoAnexoRequest = CreateOrdemServicoAnexoRequest;

export interface CreateOrdemServicoAvaliacaoRequest {
  ordemServicoId: number;
  nota: number;
  comentario: string | null;
  usuario: string | null;
}
export type UpdateOrdemServicoAvaliacaoRequest = CreateOrdemServicoAvaliacaoRequest;

export interface CreateOrdemServicoChecklistRequest {
  ordemServicoId: number;
  item: string;
  realizado: boolean;
  observacao: string | null;
}
export type UpdateOrdemServicoChecklistRequest = CreateOrdemServicoChecklistRequest;

export interface CreateOrdemServicoItemRequest {
  ordemServicoId: number;
  pecaId: number | null;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}
export type UpdateOrdemServicoItemRequest = CreateOrdemServicoItemRequest;

export interface CreateOrdemServicoObservacaoRequest {
  ordemServicoId: number;
  usuario: string | null;
  texto: string;
}
export type UpdateOrdemServicoObservacaoRequest = CreateOrdemServicoObservacaoRequest;

export interface CreateOrdemServicoHistoricoRequest {
  ordemServicoId: number;
  dataAlteracao: string;
  usuario: string | null;
  campo: string | null;
  valorAntigo: string | null;
  valorNovo: string | null;
}
export type UpdateOrdemServicoHistoricoRequest = CreateOrdemServicoHistoricoRequest;

export interface CreateOrdemServicoPagamentoRequest {
  ordemServicoId: number;
  valor: number;
  status: string;
  dataPagamento: string | null;
  metodo: string | null;
  observacao: string | null;
}
export type UpdateOrdemServicoPagamentoRequest = CreateOrdemServicoPagamentoRequest;
