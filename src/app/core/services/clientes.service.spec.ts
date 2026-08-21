import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientesService } from './clientes.service';
import { apiPaths } from './api-paths';

describe('ClientesService', () => {
  let service: ClientesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ClientesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('usa o path centralizado e o termo de busca', () => {
    service.search('ana').subscribe();
    const request = http.expectOne(request => request.url.includes(apiPaths.clientes.base));
    expect(request.request.params.get('search')).toBe('ana');
    request.flush([]);
  });
});
