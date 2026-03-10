import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class MecanicosService {
  constructor(private api: ApiClientService) {}

  list(params?: Record<string, any>) {
    return this.api.list(apiPaths.mecanicos.base, params);
  }
  get(id: string | number) {
    return this.api.getById(apiPaths.mecanicos.base, id);
  }
  create(body: any) {
    return this.api.create(apiPaths.mecanicos.base, body);
  }
  update(id: string | number, body: any) {
    return this.api.update(apiPaths.mecanicos.base, id, body);
  }
  delete(id: string | number) {
    return this.api.remove(apiPaths.mecanicos.base, id);
  }

  especialidades() {
    return this.api.list(apiPaths.mecanicos.especialidades);
  }
  vincularEspecialidade(body: any) {
    return this.api.create(apiPaths.mecanicos.especialidadesRel, body);
  }
  certificacoes(params?: Record<string, any>) {
    return this.api.list(apiPaths.mecanicos.certificacoes, params);
  }
  contatos(params?: Record<string, any>) {
    return this.api.list(apiPaths.mecanicos.contatos, params);
  }
  disponibilidades(params?: Record<string, any>) {
    return this.api.list(apiPaths.mecanicos.disponibilidades, params);
  }
  documentos(params?: Record<string, any>) {
    return this.api.list(apiPaths.mecanicos.documentos, params);
  }
  enderecos(params?: Record<string, any>) {
    return this.api.list(apiPaths.mecanicos.enderecos, params);
  }
  experiencias(params?: Record<string, any>) {
    return this.api.list(apiPaths.mecanicos.experiencias, params);
  }
}
