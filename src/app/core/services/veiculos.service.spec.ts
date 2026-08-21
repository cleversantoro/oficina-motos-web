import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VeiculosService } from './veiculos.service';
import { apiPaths } from './api-paths';

describe('VeiculosService', () => {
  let service: VeiculosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(VeiculosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('filtra veículos pelo cliente no path centralizado', () => {
    service.listByCliente(7).subscribe();
    const request = http.expectOne(request => request.url.includes(apiPaths.veiculos.base));
    expect(request.request.params.get('clienteId')).toBe('7');
    request.flush([]);
  });
});
