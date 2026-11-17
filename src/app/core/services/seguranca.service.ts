import { Injectable } from '@angular/core';
import {
  CreateSegPerfilRequest,
  CreateSegUsuarioRequest,
  SegPerfil,
  SegPermissao,
  SegUsuario,
  SegUsuarioTableItem,
  SetPerfilPermissoesRequest,
  UpdateSegPerfilRequest,
  UpdateSegUsuarioRequest,
} from '../models';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class SegurancaService {
  constructor(private readonly api: ApiClientService) {}

  listarUsuarios() {
    return this.api.list<SegUsuarioTableItem[]>(apiPaths.seguranca.usuarios);
  }

  obterUsuario(id: number | string) {
    return this.api.getById<SegUsuario>(apiPaths.seguranca.usuarios, id);
  }

  criarUsuario(body: CreateSegUsuarioRequest) {
    return this.api.create<SegUsuario, CreateSegUsuarioRequest>(apiPaths.seguranca.usuarios, body);
  }

  atualizarUsuario(id: number | string, body: UpdateSegUsuarioRequest) {
    return this.api.update<SegUsuario, UpdateSegUsuarioRequest>(apiPaths.seguranca.usuarios, id, body);
  }

  excluirUsuario(id: number | string) {
    return this.api.remove(apiPaths.seguranca.usuarios, id);
  }

  listarPerfis() {
    return this.api.list<SegPerfil[]>(apiPaths.seguranca.perfis);
  }

  obterPerfil(id: number | string) {
    return this.api.getById<SegPerfil>(apiPaths.seguranca.perfis, id);
  }

  criarPerfil(body: CreateSegPerfilRequest) {
    return this.api.create<SegPerfil, CreateSegPerfilRequest>(apiPaths.seguranca.perfis, body);
  }

  atualizarPerfil(id: number | string, body: UpdateSegPerfilRequest) {
    return this.api.update<SegPerfil, UpdateSegPerfilRequest>(apiPaths.seguranca.perfis, id, body);
  }

  excluirPerfil(id: number | string) {
    return this.api.remove(apiPaths.seguranca.perfis, id);
  }

  atualizarPermissoesPerfil(id: number | string, body: SetPerfilPermissoesRequest) {
    return this.api.update<SegPerfil, SetPerfilPermissoesRequest>(
      apiPaths.seguranca.perfis,
      `${id}/permissoes`,
      body,
    );
  }

  listarPermissoes() {
    return this.api.list<SegPermissao[]>(apiPaths.seguranca.permissoes);
  }
}
