// ============================================================
// MECÂNICO — interfaces de resposta e requisição
// Baseadas em MecanicoResponseDTO / MecanicoRequestDTO (backend)
// ============================================================

// ---- Response: sub-recursos ----

export interface MecanicoEspecialidade {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export interface MecanicoCertificacao {
  id: number;
  mecanicoId: number;
  especialidadeId: number | null;
  titulo: string;
  instituicao: string | null;
  dataConclusao: string | null;
  dataValidade: string | null;
  codigoCertificacao: string | null;
}

export interface MecanicoContato {
  id: number;
  mecanicoId: number;
  tipo: string;
  valor: string;
  principal: boolean;
  observacao: string | null;
}

export interface MecanicoDisponibilidade {
  id: number;
  mecanicoId: number;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  capacidadeAtendimentos: number;
}

export interface MecanicoDocumento {
  id: number;
  mecanicoId: number;
  tipo: string;
  numero: string;
  dataEmissao: string | null;
  dataValidade: string | null;
  orgaoExpedidor: string | null;
  arquivoUrl: string | null;
}

export interface MecanicoEndereco {
  id: number;
  mecanicoId: number;
  tipo: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string | null;
  complemento: string | null;
  principal: boolean;
}

export interface MecanicoEspecialidadeRel {
  id: number;
  mecanicoId: number;
  especialidadeId: number;
  nivel: string;
  principal: boolean;
  anotacoes: string | null;
}

export interface MecanicoExperiencia {
  id: number;
  mecanicoId: number;
  empresa: string;
  cargo: string;
  dataInicio: string | null;
  dataFim: string | null;
  resumoAtividades: string | null;
}

// ---- Response: entidade principal ----

export interface Mecanico {
  id: number;
  codigo: string;
  nome: string;
  sobrenome: string | null;
  nomeSocial: string | null;
  documentoPrincipal: string;
  tipoDocumento: number;
  dataNascimento: string | null;
  dataAdmissao: string;
  dataDemissao: string | null;
  status: string;
  especialidadePrincipalId: number | null;
  nivel: string;
  valorHora: number;
  cargaHorariaSemanal: number;
  observacoes: string | null;
  certificacoes: MecanicoCertificacao[];
  contatos: MecanicoContato[];
  disponibilidades: MecanicoDisponibilidade[];
  documentos: MecanicoDocumento[];
  enderecos: MecanicoEndereco[];
  especialidades: MecanicoEspecialidadeRel[];
  experiencias: MecanicoExperiencia[];
}

// ---- Requests ----

export interface CreateMecanicoRequest {
  codigo: string;
  nome: string;
  sobrenome: string | null;
  nomeSocial: string | null;
  documentoPrincipal: string;
  tipoDocumento: number;
  dataNascimento: string | null;
  dataAdmissao: string;
  dataDemissao: string | null;
  status: string;
  especialidadePrincipalId: number | null;
  nivel: string;
  valorHora: number;
  cargaHorariaSemanal: number;
  observacoes: string | null;
}
export type UpdateMecanicoRequest = CreateMecanicoRequest;

export interface CreateMecanicoEspecialidadeRequest {
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}
export type UpdateMecanicoEspecialidadeRequest = CreateMecanicoEspecialidadeRequest;

export interface CreateMecanicoEspecialidadeRelRequest {
  mecanicoId: number;
  especialidadeId: number;
  nivel: string;
  principal: boolean;
  anotacoes: string | null;
}
export type UpdateMecanicoEspecialidadeRelRequest = CreateMecanicoEspecialidadeRelRequest;

export interface CreateMecanicoCertificacaoRequest {
  mecanicoId: number;
  especialidadeId: number | null;
  titulo: string;
  instituicao: string | null;
  dataConclusao: string | null;
  dataValidade: string | null;
  codigoCertificacao: string | null;
}
export type UpdateMecanicoCertificacaoRequest = CreateMecanicoCertificacaoRequest;

export interface CreateMecanicoContatoRequest {
  mecanicoId: number;
  tipo: string;
  valor: string;
  principal: boolean;
  observacao: string | null;
}
export type UpdateMecanicoContatoRequest = CreateMecanicoContatoRequest;

export interface CreateMecanicoDisponibilidadeRequest {
  mecanicoId: number;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  capacidadeAtendimentos: number;
}
export type UpdateMecanicoDisponibilidadeRequest = CreateMecanicoDisponibilidadeRequest;

export interface CreateMecanicoDocumentoRequest {
  mecanicoId: number;
  tipo: string;
  numero: string;
  dataEmissao: string | null;
  dataValidade: string | null;
  orgaoExpedidor: string | null;
  arquivoUrl: string | null;
}
export type UpdateMecanicoDocumentoRequest = CreateMecanicoDocumentoRequest;

export interface CreateMecanicoEnderecoRequest {
  mecanicoId: number;
  tipo: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string | null;
  complemento: string | null;
  principal: boolean;
}
export type UpdateMecanicoEnderecoRequest = CreateMecanicoEnderecoRequest;

export interface CreateMecanicoExperienciaRequest {
  mecanicoId: number;
  empresa: string;
  cargo: string;
  dataInicio: string | null;
  dataFim: string | null;
  resumoAtividades: string | null;
}
export type UpdateMecanicoExperienciaRequest = CreateMecanicoExperienciaRequest;
