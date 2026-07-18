import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private api: ApiClientService) {}

  // Clientes
  list(params?: Record<string, any>) {
    return this.api.list(apiPaths.clientes.base, params);
  }

  listTable(params?: Record<string, any>) {
    return this.api.listTable(apiPaths.clientes.table, params);
  }

  get(id: string | number) {
    return this.api.getById(apiPaths.clientes.base, id);
  }
  create(body: any) {
    return this.api.create(apiPaths.clientes.base, body);
  }
  update(id: string | number, body: any) {
    return this.api.update(apiPaths.clientes.base, id, body);
  }
  delete(id: string | number) {
    return this.api.remove(apiPaths.clientes.base, id);
  }

  // PF / PJ
  createPf(body: any) {
    return this.api.create(apiPaths.clientes.pf, body);
  }
  updatePf(id: string | number, body: any) {
    return this.api.update(apiPaths.clientes.pf, id, body);
  }
  createPj(body: any) {
    return this.api.create(apiPaths.clientes.pj, body);
  }
  updatePj(id: string | number, body: any) {
    return this.api.update(apiPaths.clientes.pj, id, body);
  }

  // Relacionamentos diversos
  createOrigem(body: any) {
    return this.api.create(apiPaths.clientes.origens, body);
  }
  createLgpd(body: any) {
    return this.api.create(apiPaths.clientes.lgpd, body);
  }
  createIndicacao(body: any) {
    return this.api.create(apiPaths.clientes.indicacoes, body);
  }
  createFinanceiro(body: any) {
    return this.api.create(apiPaths.clientes.financeiros, body);
  }
  createEndereco(body: any) {
    return this.api.create(apiPaths.clientes.enderecos, body);
  }
  createDocumento(body: any) {
    return this.api.create(apiPaths.clientes.documentos, body);
  }
  createContato(body: any) {
    return this.api.create(apiPaths.clientes.contatos, body);
  }
  createAnexo(body: any) {
    return this.api.create(apiPaths.clientes.anexos, body);
  }

  getAnexos(params?: Record<string, any>) {
    return this.api.list(apiPaths.clientes.anexos, params);
  }

  uploadAnexo(clienteId: number, file: File, observacao?: string) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('clienteId', String(clienteId));
    if (observacao) fd.append('observacao', observacao);
    return this.api.uploadFile<any>(`${apiPaths.clientes.anexos}/upload`, fd);
  }

  deleteAnexo(id: string | number) {
    return this.api.remove(apiPaths.clientes.anexos, id);
  }

  // Endereços
  updateEndereco(id: string | number, body: any) {
    return this.api.update(apiPaths.clientes.enderecos, id, body);
  }

  deleteEndereco(id: string | number) {
    return this.api.remove(apiPaths.clientes.enderecos, id);
  }

  // Contatos
  updateContato(id: string | number, body: any) {
    return this.api.update(apiPaths.clientes.contatos, id, body);
  }

  deleteContato(id: string | number) {
    return this.api.remove(apiPaths.clientes.contatos, id);
  }

  // Financeiro
  updateFinanceiro(id: string | number, body: any) {
    return this.api.update(apiPaths.clientes.financeiros, id, body);
  }
}
