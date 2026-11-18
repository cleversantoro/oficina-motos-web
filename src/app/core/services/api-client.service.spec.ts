import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { ApiClientService } from './api-client.service';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiClientService],
    });
    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve executar list com query params filtrando undefined', () => {
    service.list('/api/v1/Clientes', { ativo: true, pagina: 1, vazio: undefined }).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/v1/Clientes?ativo=true&pagina=1`,
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve executar getById, create, update e remove', () => {
    service.getById('/api/v1/Veiculos', 10).subscribe();
    const getReq = httpMock.expectOne(`${environment.apiUrl}/api/v1/Veiculos/10`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush({ id: 10 });

    service.create('/api/v1/Veiculos', { placa: 'ABC1D23' }).subscribe();
    const postReq = httpMock.expectOne(`${environment.apiUrl}/api/v1/Veiculos`);
    expect(postReq.request.method).toBe('POST');
    postReq.flush({ id: 11 });

    service.update('/api/v1/Veiculos', 10, { placa: 'XYZ9Z99' }).subscribe();
    const putReq = httpMock.expectOne(`${environment.apiUrl}/api/v1/Veiculos/10`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({ id: 10 });

    service.remove('/api/v1/Veiculos', 10).subscribe();
    const delReq = httpMock.expectOne(`${environment.apiUrl}/api/v1/Veiculos/10`);
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush(null);
  });

  it('deve executar downloadBlob com responseType blob', () => {
    service.downloadBlob('/api/v1/OrdemServicos/5/pdf').subscribe((blob) => {
      expect(blob.size).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/OrdemServicos/5/pdf`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
  });
});
