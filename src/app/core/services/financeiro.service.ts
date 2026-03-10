import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  constructor(private api: ApiClientService) {}

  metodos() {
    return this.api.list(apiPaths.financeiro.metodos);
  }

  pagamentos(params?: Record<string, any>) {
    return this.api.list(apiPaths.financeiro.pagamentos, params);
  }
  anexos(params?: Record<string, any>) {
    return this.api.list(apiPaths.financeiro.anexos, params);
  }
  contasPagar(params?: Record<string, any>) {
    return this.api.list(apiPaths.financeiro.pagar, params);
  }
  contasReceber(params?: Record<string, any>) {
    return this.api.list(apiPaths.financeiro.receber, params);
  }
  historicos(params?: Record<string, any>) {
    return this.api.list(apiPaths.financeiro.historicos, params);
  }
  lancamentos(params?: Record<string, any>) {
    return this.api.list(apiPaths.financeiro.lancamentos, params);
  }
}
