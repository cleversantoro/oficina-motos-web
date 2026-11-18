import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { FornecedoresService } from './fornecedores.service';

describe('FornecedoresService', () => {
  let service: FornecedoresService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), FornecedoresService],
    });
    service = TestBed.inject(FornecedoresService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve consultar lista, detalhe e sub-recursos de fornecedores', () => {
    service.list().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/Fornecedores`).flush([]);

    service.get(3).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/Fornecedores/3`).flush({ id: 3 });

    service.segmentos().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/FornecedorSegmentos`).flush([]);

    service.representantes({ fornecedorId: 3 }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/FornecedorRepresentantes?fornecedorId=3`).flush([]);
  });

  it('deve criar e excluir fornecedor', () => {
    service.create({ razaoSocial: 'Moto Peças Ltda' }).subscribe();
    const post = httpMock.expectOne(`${environment.apiUrl}/api/v1/Fornecedores`);
    expect(post.request.method).toBe('POST');
    post.flush({ id: 9 });

    service.delete(9).subscribe();
    const del = httpMock.expectOne(`${environment.apiUrl}/api/v1/Fornecedores/9`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });
});
