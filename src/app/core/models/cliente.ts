// ============================================================
// CLIENTE — interfaces de resposta e requisição
// Baseadas em ClienteResponseDTO / ClienteRequestDTO (backend)
// ============================================================

// ---- Enums ----

export enum ClienteTipo {
  PessoaFisica = 1,
  PessoaJuridica = 2,
}

export enum ClienteStatus {
  Inativo = 0,
  Ativo = 1,
  Suspenso = 2,
  Bloqueado = 3,
}

// ---- Response: sub-recursos ----

export interface ClienteOrigem {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface ClientePf {
  id: number;
  clienteId: number;
  cpf: string;
  rg: string | null;
  dataNascimento: string | null;
  genero: string | null;
  estadoCivil: string | null;
  profissao: string | null;
}

export interface ClientePj {
  id: number;
  clienteId: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  responsavel: string | null;
}

export interface ClienteFinanceiro {
  id: number;
  clienteId: number;
  limiteCredito: number | null;
  prazoPagamento: number | null;
  bloqueado: boolean;
  observacoes: string | null;
}

export interface ClienteAnexo {
  id: number;
  clienteId: number;
  nome: string;
  tipo: string;
  url: string;
  observacao: string | null;
}

export interface ClienteContato {
  id: number;
  clienteId: number;
  tipo: number;
  valor: string;
  principal: boolean;
  observacao: string | null;
}

export interface ClienteDocumento {
  id: number;
  clienteId: number;
  tipo: string;
  documento: string;
  dataEmissao: string | null;
  dataValidade: string | null;
  orgaoExpedidor: string | null;
  principal: boolean;
}

export interface ClienteEndereco {
  id: number;
  clienteId: number;
  tipo: number;
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

export interface ClienteIndicacao {
  id: number;
  clienteId: number;
  indicadorNome: string;
  indicadorTelefone: string | null;
  observacao: string | null;
}

export interface ClienteLgpdConsentimento {
  id: number;
  clienteId: number;
  tipo: number;
  aceito: boolean;
  data: string | null;
  validoAte: string | null;
  observacoes: string | null;
  canal: string;
}

// ---- Response: entidade principal ----

export interface Cliente {
  id: number;
  codigo: number;
  nome: string;
  nomeExibicao: string;
  email: string | null;
  telefone: string | null;
  documento: string;
  tipo: number;
  status: number;
  vip: boolean;
  observacoes: string | null;
  origemCadastroId: number;
  origemId: number | null;
  origemDescricao: string | null;
  origem: ClienteOrigem | null;
  pessoaFisica: ClientePf | null;
  pessoaJuridica: ClientePj | null;
  financeiro: ClienteFinanceiro | null;
  anexos: ClienteAnexo[];
  contatos: ClienteContato[];
  documentos: ClienteDocumento[];
  enderecos: ClienteEndereco[];
  indicacoes: ClienteIndicacao[];
  consentimentosLgpd: ClienteLgpdConsentimento[];
  createdAt: string;
  updatedAt: string | null;
}

/** Versão resumida retornada pelo endpoint /table (listagem paginada). */
export interface ClienteTableRow {
  id: number;
  codigo: number;
  nome: string;
  nomeExibicao: string;
  email: string | null;
  telefone: string | null;
  documento: string;
  tipo: number;
  tipoDescricao: string | null;
  status: number;
  statusDescricao: string | null;
  vip: boolean;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ---- Requests ----

export interface CreateClienteRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
}

export interface UpdateClienteRequest {
  nome: string;
  nomeExibicao: string;
  documento: string;
  tipo: number;
  status: number;
  vip: boolean;
  observacoes: string | null;
  origemCadastroId: number;
  telefone: string | null;
  email: string | null;
  origemId: number | null;
}

export interface CreateClienteOrigemRequest {
  nome: string;
  descricao: string | null;
}
export type UpdateClienteOrigemRequest = CreateClienteOrigemRequest;

export interface CreateClientePfRequest {
  clienteId: number;
  cpf: string;
  rg: string | null;
  dataNascimento: string | null;
  genero: string | null;
  estadoCivil: string | null;
  profissao: string | null;
}
export type UpdateClientePfRequest = CreateClientePfRequest;

export interface CreateClientePjRequest {
  clienteId: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  responsavel: string | null;
}
export type UpdateClientePjRequest = CreateClientePjRequest;

export interface CreateClienteFinanceiroRequest {
  clienteId: number;
  limiteCredito: number | null;
  prazoPagamento: number | null;
  bloqueado: boolean;
  observacoes: string | null;
}
export type UpdateClienteFinanceiroRequest = CreateClienteFinanceiroRequest;

export interface CreateClienteEnderecoRequest {
  clienteId: number;
  tipo: number;
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
export type UpdateClienteEnderecoRequest = CreateClienteEnderecoRequest;

export interface CreateClienteContatoRequest {
  clienteId: number;
  tipo: number;
  valor: string;
  principal: boolean;
  observacao: string | null;
}
export type UpdateClienteContatoRequest = CreateClienteContatoRequest;

export interface CreateClienteDocumentoRequest {
  clienteId: number;
  tipo: string;
  documento: string;
  dataEmissao: string | null;
  dataValidade: string | null;
  orgaoExpedidor: string | null;
  principal: boolean;
}
export type UpdateClienteDocumentoRequest = CreateClienteDocumentoRequest;

export interface CreateClienteAnexoRequest {
  clienteId: number;
  nome: string;
  tipo: string;
  url: string;
  observacao: string | null;
}
export type UpdateClienteAnexoRequest = CreateClienteAnexoRequest;

export interface CreateClienteIndicacaoRequest {
  clienteId: number;
  indicadorNome: string;
  indicadorTelefone: string | null;
  observacao: string | null;
}
export type UpdateClienteIndicacaoRequest = CreateClienteIndicacaoRequest;

export interface CreateClienteLgpdConsentimentoRequest {
  clienteId: number;
  tipo: number;
  aceito: boolean;
  data: string | null;
  validoAte: string | null;
  observacoes: string | null;
  canal: string;
}
export type UpdateClienteLgpdConsentimentoRequest = CreateClienteLgpdConsentimentoRequest;
