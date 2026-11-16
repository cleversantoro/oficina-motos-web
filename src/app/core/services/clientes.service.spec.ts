import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ClientesService } from './clientes.service';
import { apiPaths } from './api-paths';

describe('ClientesService (US-030 / T-030.2)', () => {
  let service: ClientesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ClientesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista todos os clientes via GET em apiPaths.clientes.base', () => {
    const mockClientes = [{ id: 1, nome: 'Carlos Eduardo', documento: '52998224725' }];

    service.list().subscribe(res => {
      expect(res).toEqual(mockClientes);
    });

    const request = http.expectOne(req => req.url.endsWith(apiPaths.clientes.base));
    expect(request.request.method).toBe('GET');
    request.flush(mockClientes);
  });

  it('usa o path centralizado e o termo de busca em search()', () => {
    service.search('ana').subscribe();
    const request = http.expectOne(req => req.url.includes(apiPaths.clientes.base));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('search')).toBe('ana');
    request.flush([]);
  });

  it('busca um cliente por ID via GET em apiPaths.clientes.base/:id', () => {
    const mockCliente = { id: 42, nome: 'Ana Clara', documento: '11144477735' };

    service.get(42).subscribe(res => {
      expect(res).toEqual(mockCliente);
    });

    const request = http.expectOne(req => req.url.endsWith(`${apiPaths.clientes.base}/42`));
    expect(request.request.method).toBe('GET');
    request.flush(mockCliente);
  });

  it('cria um novo cliente via POST em apiPaths.clientes.base', () => {
    const createPayload = {
      nome: 'Marcos Silva',
      cpf: '52998224725',
      email: 'marcos@oficina.com',
      telefone: '11988887777',
    };
    const mockCreated = { id: 101, ...createPayload };

    service.create(createPayload).subscribe(res => {
      expect(res).toEqual(mockCreated);
    });

    const request = http.expectOne(req => req.url.endsWith(apiPaths.clientes.base));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(createPayload);
    request.flush(mockCreated);
  });

  it('atualiza um cliente existente via PUT em apiPaths.clientes.base/:id', () => {
    const updatePayload = {
      nome: 'Marcos Silva VIP',
      documento: '52998224725',
      tipo: 1,
      status: 1,
      vip: true,
    };
    const mockUpdated = { id: 101, ...updatePayload };

    service.update(101, updatePayload).subscribe(res => {
      expect(res).toEqual(mockUpdated);
    });

    const request = http.expectOne(req => req.url.endsWith(`${apiPaths.clientes.base}/101`));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(updatePayload);
    request.flush(mockUpdated);
  });

  it('remove um cliente via DELETE em apiPaths.clientes.base/:id', () => {
    service.delete(101).subscribe();

    const request = http.expectOne(req => req.url.endsWith(`${apiPaths.clientes.base}/101`));
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
