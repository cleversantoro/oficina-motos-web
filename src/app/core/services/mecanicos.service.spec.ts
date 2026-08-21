import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MecanicosService } from './mecanicos.service';
import { apiPaths } from './api-paths';

describe('MecanicosService', () => {
  let service: MecanicosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(MecanicosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carrega mecânicos pelo path centralizado', () => {
    service.getAll().subscribe();
    const request = http.expectOne(request => request.url.endsWith(apiPaths.mecanicos.base));
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });
});
