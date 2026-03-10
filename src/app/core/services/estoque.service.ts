import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  constructor(private api: ApiClientService) {}

  pecas(params?: Record<string, any>) {
    return this.api.list(apiPaths.estoque.pecas, params);
  }
  getPeca(id: string | number) {
    return this.api.getById(apiPaths.estoque.pecas, id);
  }
  criarPeca(body: any) {
    return this.api.create(apiPaths.estoque.pecas, body);
  }
  atualizarPeca(id: string | number, body: any) {
    return this.api.update(apiPaths.estoque.pecas, id, body);
  }
  removerPeca(id: string | number) {
    return this.api.remove(apiPaths.estoque.pecas, id);
  }

  categorias() {
    return this.api.list(apiPaths.estoque.categorias);
  }
  fabricantes() {
    return this.api.list(apiPaths.estoque.fabricantes);
  }
  localizacoes() {
    return this.api.list(apiPaths.estoque.localizacoes);
  }

  movimentar(body: any) {
    return this.api.create(apiPaths.estoque.movimentacoes, body);
  }
  anexos(params?: Record<string, any>) {
    return this.api.list(apiPaths.estoque.anexos, params);
  }
  fornecedores(params?: Record<string, any>) {
    return this.api.list(apiPaths.estoque.fornecedores, params);
  }
  historicos(params?: Record<string, any>) {
    return this.api.list(apiPaths.estoque.historicos, params);
  }
}
