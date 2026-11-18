import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { VeiculosService } from './veiculos.service';

describe('VeiculosService', () => {
  let service: VeiculosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), VeiculosService],
    });
    service = TestBed.inject(VeiculosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar veículos, marcas e modelos', () => {
    service.list().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/Veiculos`).flush([]);

    service.marcas().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/VeiculoMarcas`).flush([]);

    service.modelos({ marcaId: 1 }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/VeiculoModelos?marcaId=1`).flush([]);
  });

  it('deve listar veículos por cliente e realizar CRUD', () => {
    service.listByCliente(7).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/Veiculos?clienteId=7`).flush([]);

    service.create({ placa: 'BRA2E19' }).subscribe();
    const post = httpMock.expectOne(`${environment.apiUrl}/api/v1/Veiculos`);
    expect(post.request.method).toBe('POST');
    post.flush({ id: 1 });

    service.delete(1).subscribe();
    const del = httpMock.expectOne(`${environment.apiUrl}/api/v1/Veiculos/1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });
});
