import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { OrdensService } from './ordens.service';
import { apiPaths } from './api-paths';

describe('OrdensService (US-030 / T-030.3)', () => {
  let service: OrdensService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(OrdensService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista todas as ordens de serviço via getAll() no path centralizado', () => {
    const mockOrdens = [
      {
        id: 10,
        numeroOs: 'OS-2026-0010',
        clienteId: 1,
        veiculoId: 2,
        mecanicoId: 3,
        descricaoProblema: 'Revisão geral',
        status: 'Aberta',
        dataAbertura: '2026-11-16T10:00:00Z',
        dataConclusao: null,
      },
    ];

    service.getAll().subscribe(res => {
      expect(res).toEqual(mockOrdens);
    });

    const request = http.expectOne(req => req.url.endsWith(apiPaths.ordens.base));
    expect(request.request.method).toBe('GET');
    request.flush(mockOrdens);
  });

  it('cria ordem pelo path centralizado via create()', () => {
    const dto = {
      clienteId: 1,
      veiculoId: 2,
      mecanicoId: 3,
      descricaoProblema: 'Teste',
      status: 'Aberta',
      dataAbertura: null,
      dataConclusao: null,
    };

    service.create(dto).subscribe(res => {
      expect(res).toEqual({ id: 10 } as any);
    });

    const request = http.expectOne(req => req.url.endsWith(apiPaths.ordens.base));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dto);
    request.flush({ id: 10 });
  });

  it('altera o status de uma ordem de serviço via changeStatus()', () => {
    const updatedOs = {
      id: 10,
      status: 'EmAndamento',
    };

    service.changeStatus(10, 'EmAndamento').subscribe(res => {
      expect(res).toEqual(updatedOs as any);
    });

    const request = http.expectOne(req => req.url.endsWith(`${apiPaths.ordens.base}/10`));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ status: 'EmAndamento' });
    request.flush(updatedOs);
  });
});
