import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class VeiculosService {
  constructor(private api: ApiClientService) {}

  list(params?: Record<string, any>) {
    return this.api.list(apiPaths.veiculos.base, params);
  }
  get(id: string | number) {
    return this.api.getById(apiPaths.veiculos.base, id);
  }
  create(body: any) {
    return this.api.create(apiPaths.veiculos.base, body);
  }
  update(id: string | number, body: any) {
    return this.api.update(apiPaths.veiculos.base, id, body);
  }
  delete(id: string | number) {
    return this.api.remove(apiPaths.veiculos.base, id);
  }

  marcas() {
    return this.api.list(apiPaths.veiculos.marcas);
  }
  modelos(params?: Record<string, any>) {
    return this.api.list(apiPaths.veiculos.modelos, params);
  }
}
