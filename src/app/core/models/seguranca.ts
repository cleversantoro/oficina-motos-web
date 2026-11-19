export interface SegPerfilResumo {
  id: number;
  nome: string;
  nivel: number;
}

export interface SegUsuarioTableItem {
  id: number;
  nome: string;
  login: string;
  email: string;
  status: number;
  statusDescricao: string;
  perfis: string;
  ultimoLogin?: string | null;
}

export interface SegUsuario {
  id: number;
  nome: string;
  email: string;
  login: string;
  telefone?: string | null;
  fotoUrl?: string | null;
  status: number;
  statusDescricao: string;
  ultimoLogin?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  perfis: SegPerfilResumo[];
}

export interface CreateSegUsuarioRequest {
  nome: string;
  email: string;
  login: string;
  senha: string;
  telefone?: string | null;
  perfilId: number;
}

export interface UpdateSegUsuarioRequest {
  nome: string;
  email: string;
  login: string;
  telefone?: string | null;
  status: number;
  perfilId?: number | null;
}

export interface SegPermissao {
  id: number;
  moduloId: number;
  nomeModulo?: string;
  moduloNome?: string;
  acao: string;
  codigo?: string;
  descricao?: string | null;
}

export interface SegPerfil {
  id: number;
  nome: string;
  descricao?: string | null;
  nivel: number;
  status: number;
  createdAt?: string;
  updatedAt?: string | null;
  permissoes: SegPermissao[];
}

export interface CreateSegPerfilRequest {
  nome: string;
  descricao?: string | null;
  nivel: number;
}

export interface UpdateSegPerfilRequest {
  nome: string;
  descricao?: string | null;
  nivel: number;
  status: number;
}

export interface SetPerfilPermissoesRequest {
  permissaoIds: number[];
}
