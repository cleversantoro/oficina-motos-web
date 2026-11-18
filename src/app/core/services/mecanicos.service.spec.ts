import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { MecanicosService } from './mecanicos.service';

describe('MecanicosService', () => {
  let service: MecanicosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), MecanicosService],
    });
    service = TestBed.inject(MecanicosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar mecânicos e especialidades', () => {
    service.list().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/Mecanicos`).flush([]);

    service.especialidades().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/MecanicoEspecialidades`).flush([]);
  });

  it('deve obter, atualizar e excluir mecânico', () => {
    service.get(4).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/Mecanicos/4`).flush({ id: 4 });

    service.update(4, { nome: 'Roberto' }).subscribe();
    const put = httpMock.expectOne(`${environment.apiUrl}/api/v1/Mecanicos/4`);
    expect(put.request.method).toBe('PUT');
    put.flush({ id: 4 });

    service.delete(4).subscribe();
    const del = httpMock.expectOne(`${environment.apiUrl}/api/v1/Mecanicos/4`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });
});
