import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdensService } from './ordens.service';
import { apiPaths } from './api-paths';

describe('OrdensService', () => {
  let service: OrdensService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(OrdensService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('cria ordem pelo path centralizado', () => {
    const dto = {
      clienteId: 1,
      veiculoId: 2,
      mecanicoId: 3,
      descricaoProblema: 'Teste',
      status: 'Aberta',
      dataAbertura: null,
      dataConclusao: null,
    };

    service.create(dto).subscribe();
    const request = http.expectOne(request => request.url.endsWith(apiPaths.ordens.base));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dto);
    request.flush({ id: 10 });
  });
});
