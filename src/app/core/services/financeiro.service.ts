import { Injectable } from '@angular/core';
import {
  CreateFinanceiroContaPagarRequest,
  FinanceiroAnexo,
  FinanceiroContaPagar,
  FinanceiroContaReceber,
  FinanceiroHistorico,
  FinanceiroLancamento,
  FinanceiroMetodoPagamento,
  FinanceiroPagamento,
  UpdateFinanceiroContaPagarRequest,
} from '../models';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  constructor(private api: ApiClientService) {}

  metodos() {
    return this.api.list<FinanceiroMetodoPagamento[]>(apiPaths.financeiro.metodos);
  }

  pagamentos(params?: Record<string, any>) {
    return this.api.list<FinanceiroPagamento[]>(apiPaths.financeiro.pagamentos, params);
  }
  anexos(params?: Record<string, any>) {
    return this.api.list<FinanceiroAnexo[]>(apiPaths.financeiro.anexos, params);
  }
  contasPagar(params?: Record<string, any>) {
    return this.api.list<FinanceiroContaPagar[]>(apiPaths.financeiro.pagar, params);
  }
  getContaPagarById(id: number | string) {
    return this.api.getById<FinanceiroContaPagar>(apiPaths.financeiro.pagar, id);
  }
  createContaPagar(payload: CreateFinanceiroContaPagarRequest) {
    return this.api.create<FinanceiroContaPagar, CreateFinanceiroContaPagarRequest>(
      apiPaths.financeiro.pagar,
      payload,
    );
  }
  updateContaPagar(id: number | string, payload: UpdateFinanceiroContaPagarRequest) {
    return this.api.update<FinanceiroContaPagar, UpdateFinanceiroContaPagarRequest>(
      apiPaths.financeiro.pagar,
      id,
      payload,
    );
  }
  contasReceber(params?: Record<string, any>) {
    return this.api.list<FinanceiroContaReceber[]>(apiPaths.financeiro.receber, params);
  }
  historicos(params?: Record<string, any>) {
    return this.api.list<FinanceiroHistorico[]>(apiPaths.financeiro.historicos, params);
  }
  lancamentos(params?: Record<string, any>) {
    return this.api.list<FinanceiroLancamento[]>(apiPaths.financeiro.lancamentos, params);
  }
}


