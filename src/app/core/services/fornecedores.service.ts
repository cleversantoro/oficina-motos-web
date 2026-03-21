import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class FornecedoresService {
  constructor(private api: ApiClientService) {}

  list(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.base, params);
  }
  get(id: string | number) {
    return this.api.getById(apiPaths.fornecedores.base, id);
  }
  create(body: any) {
    return this.api.create(apiPaths.fornecedores.base, body);
  }
  update(id: string | number, body: any) {
    return this.api.update(apiPaths.fornecedores.base, id, body);
  }
  delete(id: string | number) {
    return this.api.remove(apiPaths.fornecedores.base, id);
  }

  segmentos(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.segmentos, params);
  }
  segmentosRel(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.segmentosRel, params);
  }
  vincularSegmento(body: any) {
    return this.api.create(apiPaths.fornecedores.segmentosRel, body);
  }

  enderecos(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.enderecos, params);
  }
  contatos(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.contatos, params);
  }
  representantes(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.representantes, params);
  }
  bancos(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.bancos, params);
  }
  documentos(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.documentos, params);
  }
  certificacoes(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.certificacoes, params);
  }
  avaliacoes(params?: Record<string, any>) {
    return this.api.list(apiPaths.fornecedores.avaliacoes, params);
  }
}
