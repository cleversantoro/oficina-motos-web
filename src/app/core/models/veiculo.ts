// ============================================================
// VEÍCULO — interfaces de resposta e requisição
// Baseadas em VeiculoResponseDTO / VeiculoRequestDTO (backend)
// ============================================================

// ---- Response ----

export interface VeiculoMarca {
  id: number;
  nome: string;
  pais: string | null;
}

export interface VeiculoModelo {
  id: number;
  marcaId: number;
  nome: string;
  anoInicio: number | null;
  anoFim: number | null;
}

export interface Veiculo {
  id: number;
  clienteId: number;
  placa: string;
  modeloId: number | null;
  anoFab: number | null;
  anoMod: number | null;
  cor: string | null;
  chassi: string | null;
  renavam: string | null;
  km: string | null;
  combustivel: string | null;
  observacao: string | null;
  principal: boolean;
  ativo: boolean;
}

// ---- Requests ----

export interface CreateVeiculoRequest {
  clienteId: number;
  placa: string;
  modeloId: number | null;
  anoFab: number | null;
  anoMod: number | null;
  cor: string | null;
  chassi: string | null;
  renavam: string | null;
  km: string | null;
  combustivel: string | null;
  observacao: string | null;
  principal: boolean;
  ativo: boolean;
}
export type UpdateVeiculoRequest = CreateVeiculoRequest;

export interface CreateVeiculoMarcaRequest {
  nome: string;
  pais: string | null;
}
export type UpdateVeiculoMarcaRequest = CreateVeiculoMarcaRequest;

export interface CreateVeiculoModeloRequest {
  marcaId: number;
  nome: string;
  anoInicio: number | null;
  anoFim: number | null;
}
export type UpdateVeiculoModeloRequest = CreateVeiculoModeloRequest;
