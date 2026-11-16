import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CreateFinanceiroContaPagarRequest,
  FinanceiroContaPagar,
  UpdateFinanceiroContaPagarRequest,
} from '../models';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';
import { FinanceiroService } from './financeiro.service';

describe('FinanceiroService (US-020 / US-021)', () => {
  let service: FinanceiroService;

  const apiMock = {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const mockConta: FinanceiroContaPagar = {
    id: 9201,
    fornecedorId: 301,
    descricao: 'Compra de filtros de óleo Bosch',
    valor: 580,
    vencimento: '2026-11-25',
    status: 'PENDENTE',
    dataPagamento: null,
    metodoId: 904,
    observacao: 'Prazo 10 dias via PIX',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        FinanceiroService,
        { provide: ApiClientService, useValue: apiMock },
      ],
    });
    service = TestBed.inject(FinanceiroService);
  });

  it('deve listar contas a pagar usando apiPaths.financeiro.pagar', () => {
    apiMock.list.mockReturnValue(of([mockConta]));

    service.contasPagar().subscribe((res) => {
      expect(res).toEqual([mockConta]);
    });

    expect(apiMock.list).toHaveBeenCalledWith(apiPaths.financeiro.pagar, undefined);
  });

  it('deve buscar uma conta a pagar por ID usando getById (T-021.3)', () => {
    apiMock.getById.mockReturnValue(of(mockConta));

    service.getContaPagarById(9201).subscribe((res) => {
      expect(res).toEqual(mockConta);
    });

    expect(apiMock.getById).toHaveBeenCalledWith('/api/v1/FinanceiroContasPagar', 9201);
  });

  it('deve criar uma nova conta a pagar usando create (T-021.3)', () => {
    const payload: CreateFinanceiroContaPagarRequest = {
      fornecedorId: 301,
      descricao: 'Compra de kit relação DID',
      valor: 1250.5,
      vencimento: '2026-11-30',
      status: 'PENDENTE',
      dataPagamento: null,
      metodoId: 904,
      observacao: 'NF 45892',
    };
    apiMock.create.mockReturnValue(of({ id: 9205, ...payload }));

    service.createContaPagar(payload).subscribe((res) => {
      expect(res.id).toBe(9205);
      expect(res.descricao).toBe('Compra de kit relação DID');
    });

    expect(apiMock.create).toHaveBeenCalledWith('/api/v1/FinanceiroContasPagar', payload);
  });

  it('deve atualizar uma conta a pagar existente usando update (T-021.3)', () => {
    const payload: UpdateFinanceiroContaPagarRequest = {
      fornecedorId: 301,
      descricao: 'Compra de filtros de óleo Bosch (Atualizado)',
      valor: 620,
      vencimento: '2026-11-28',
      status: 'PAGO',
      dataPagamento: '2026-11-16',
      metodoId: 904,
      observacao: 'Quitado antecipadamente',
    };
    apiMock.update.mockReturnValue(of({ id: 9201, ...payload }));

    service.updateContaPagar(9201, payload).subscribe((res) => {
      expect(res.id).toBe(9201);
      expect(res.status).toBe('PAGO');
    });

    expect(apiMock.update).toHaveBeenCalledWith('/api/v1/FinanceiroContasPagar', 9201, payload);
  });
});
