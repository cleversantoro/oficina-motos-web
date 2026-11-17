import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { environment } from '../../../environments/environment';
import { SegurancaService } from './seguranca.service';

describe('SegurancaService', () => {
  let service: SegurancaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SegurancaService],
    });
    service = TestBed.inject(SegurancaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar usuários em GET /api/v1/Usuarios', () => {
    service.listarUsuarios().subscribe(res => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/Usuarios`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, nome: 'Admin', login: 'admin', email: 'admin@oficina.com', status: 1, statusDescricao: 'Ativo', perfis: 'Administrador' }]);
  });

  it('deve criar usuário em POST /api/v1/Usuarios', () => {
    const payload = {
      nome: 'Novo Usuário',
      login: 'novo',
      email: 'novo@oficina.com',
      senha: 'Password@123',
      perfilId: 2,
    };

    service.criarUsuario(payload).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/Usuarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 2, ...payload, status: 1, statusDescricao: 'Ativo', perfis: [] });
  });

  it('deve listar perfis em GET /api/v1/Perfis e permissões em GET /api/v1/Permissoes', () => {
    service.listarPerfis().subscribe();
    service.listarPermissoes().subscribe();

    const reqPerfis = httpMock.expectOne(`${environment.apiUrl}/api/v1/Perfis`);
    expect(reqPerfis.request.method).toBe('GET');
    reqPerfis.flush([]);

    const reqPermissoes = httpMock.expectOne(`${environment.apiUrl}/api/v1/Permissoes`);
    expect(reqPermissoes.request.method).toBe('GET');
    reqPermissoes.flush([]);
  });

  it('deve atualizar permissões do perfil em PUT /api/v1/Perfis/{id}/permissoes', () => {
    service.atualizarPermissoesPerfil(1, { permissaoIds: [1, 2, 3] }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/Perfis/1/permissoes`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ permissaoIds: [1, 2, 3] });
    req.flush({ id: 1, nome: 'Administrador', nivel: 1, status: 1, permissoes: [] });
  });
});
