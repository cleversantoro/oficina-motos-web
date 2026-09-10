import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';
import {
  CreateOrdemServicoItemRequest,
  CreateOrdemServicoRequest,
  OrdemServico,
  OrdemServicoItem,
  UpdateOrdemServicoRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class OrdensService {
  constructor(private api: ApiClientService) {}

  list<T = any>(params?: Record<string, any>) {
    return this.api.list<T>(apiPaths.ordens.base, params);
  }
  get(id: string | number) {
    return this.api.getById(apiPaths.ordens.base, id);
  }
  create<T = OrdemServico, B = CreateOrdemServicoRequest>(body: B) {
    return this.api.create<T, B>(apiPaths.ordens.base, body);
  }
  update<T = OrdemServico, B = UpdateOrdemServicoRequest>(id: string | number, body: B) {
    return this.api.update<T, B>(apiPaths.ordens.base, id, body);
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
  addItem<T = OrdemServicoItem, B = CreateOrdemServicoItemRequest>(body: B) {
    return this.api.create<T, B>(apiPaths.ordens.itens, body);
  }
  deleteItem(itemId: string | number) {
    return this.api.remove(apiPaths.ordens.itens, itemId);
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
