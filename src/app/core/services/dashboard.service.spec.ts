import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DashboardService } from './dashboard.service';
import { apiPaths } from './api-paths';
import { DashboardKpisResponse } from '../models/dashboard';
import { environment } from '../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DashboardService],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve chamar GET /api/v1/Dashboard/kpis sem parametros quando periodo nao for informado', () => {
    const mockResponse: DashboardKpisResponse = {
      periodo: '2026-11',
      osAbertas: 4,
      osDoDia: 2,
      osConcluidasMes: 7,
      faturamentoMensal: 3500,
      ticketMedio: 500,
      pecasAbaixoMinimo: 1,
      osPorStatus: [{ status: 'Aberta', label: 'Aberta', quantidade: 4 }],
      faturamentoUltimosSeisMeses: [{ mes: '2026-11', rotulo: 'Nov/26', valor: 3500, quantidadeOs: 7 }],
      pecasCriticas: [
        {
          id: 9,
          codigo: 'PAST-01',
          descricao: 'Pastilha de Freio',
          quantidadeAtual: 1,
          estoqueMinimo: 5,
          deficit: 4,
          unidade: 'UN',
        },
      ],
    };

    let responseData: DashboardKpisResponse | undefined;
    service.getKpis().subscribe(res => (responseData = res));

    const req = httpMock.expectOne(`${baseUrl}${apiPaths.dashboard.kpis}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(responseData).toEqual(mockResponse);
  });

  it('deve chamar GET /api/v1/Dashboard/kpis?periodo=2026-11 quando periodo for informado', () => {
    service.getKpis('2026-11').subscribe();

    const req = httpMock.expectOne(`${baseUrl}${apiPaths.dashboard.kpis}?periodo=2026-11`);
    expect(req.request.method).toBe('GET');
    req.flush({
      periodo: '2026-11',
      osAbertas: 0,
      osDoDia: 0,
      osConcluidasMes: 0,
      faturamentoMensal: 0,
      ticketMedio: 0,
      pecasAbaixoMinimo: 0,
      osPorStatus: [],
      faturamentoUltimosSeisMeses: [],
      pecasCriticas: [],
    });
  });
});
