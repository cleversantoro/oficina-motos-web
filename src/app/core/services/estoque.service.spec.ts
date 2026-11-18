import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { EstoqueService } from './estoque.service';

describe('EstoqueService', () => {
  let service: EstoqueService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), EstoqueService],
    });
    service = TestBed.inject(EstoqueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar peças, categorias, fabricantes e localizações', () => {
    service.pecas().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/EstoquePecas`).flush([]);

    service.categorias().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/EstoqueCategorias`).flush([]);

    service.fabricantes().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/EstoqueFabricantes`).flush([]);

    service.localizacoes().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/v1/EstoqueLocalizacoes`).flush([]);
  });

  it('deve registrar movimentação e remover peça', () => {
    service.movimentar({ pecaId: 1, tipo: 'ENTRADA', quantidade: 5 }).subscribe();
    const post = httpMock.expectOne(`${environment.apiUrl}/api/v1/EstoqueMovimentacoes`);
    expect(post.request.method).toBe('POST');
    post.flush({ id: 20 });

    service.removerPeca(1).subscribe();
    const del = httpMock.expectOne(`${environment.apiUrl}/api/v1/EstoquePecas/1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });
});
