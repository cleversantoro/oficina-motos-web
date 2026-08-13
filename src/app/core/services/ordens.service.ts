import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class OrdensService {
  constructor(private api: ApiClientService) {}

  list<T = any>(params?: Record<string, any>) {
    return this.api.list<T>(apiPaths.ordens.base, params);
  }
  get(id: string | number) {
    return this.api.getById(apiPaths.ordens.base, id);
  }
  create(body: any) {
    return this.api.create(apiPaths.ordens.base, body);
  }
  update(id: string | number, body: any) {
    return this.api.update(apiPaths.ordens.base, id, body);
  }
  delete(id: string | number) {
    return this.api.remove(apiPaths.ordens.base, id);
  }

  pagamentos(params?: Record<string, any>) {
    return this.api.list(apiPaths.ordens.pagamentos, params);
  }
  observacoes(params?: Record<string, any>) {
    return this.api.list(apiPaths.ordens.observacoes, params);
  }
  itens(params?: Record<string, any>) {
    return this.api.list(apiPaths.ordens.itens, params);
  }
  historicos(params?: Record<string, any>) {
    return this.api.list(apiPaths.ordens.historicos, params);
  }
  checklists(params?: Record<string, any>) {
    return this.api.list(apiPaths.ordens.checklists, params);
  }
  avaliacoes(params?: Record<string, any>) {
    return this.api.list(apiPaths.ordens.avaliacoes, params);
  }
  anexos(params?: Record<string, any>) {
    return this.api.list(apiPaths.ordens.anexos, params);
  }
}
