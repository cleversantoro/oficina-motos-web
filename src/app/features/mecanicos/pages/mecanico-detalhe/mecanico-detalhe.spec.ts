import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MecanicoDetalheComponent } from './mecanico-detalhe';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { routes } from '../../../../app.routes';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}

describe('MecanicoDetalheComponent', () => {
  let fixture: ComponentFixture<MecanicoDetalheComponent>;
  let component: MecanicoDetalheComponent;
  let router: Router;

  const mockMecanico = {
    id: 1,
    codigo: 'MEC-001',
    nome: 'Carlos',
    sobrenome: 'Silva',
    nomeSocial: null,
    documentoPrincipal: '12345678909',
    tipoDocumento: 1,
    dataNascimento: '1988-03-20T00:00:00',
    dataAdmissao: '2024-01-10T00:00:00',
    dataDemissao: null,
    status: 'Ativo',
    especialidadePrincipalId: 1,
    nivel: 'Senior',
    valorHora: 95.0,
    cargaHorariaSemanal: 44,
    observacoes: 'Especialista em motores.',
    especialidades: [
      { id: 10, mecanicoId: 1, especialidadeId: 1, nivel: 'Senior', principal: true, anotacoes: 'Principal' },
    ],
    disponibilidades: [
      { id: 5, mecanicoId: 1, diaSemana: 1, horaInicio: '08:00', horaFim: '18:00', capacidadeAtendimentos: 4 },
    ],
    certificacoes: [],
    experiencias: [],
    documentos: [],
    enderecos: [
      {
        id: 2,
        mecanicoId: 1,
        tipo: 'Residencial',
        cep: '01001000',
        logradouro: 'Rua A',
        numero: '10',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        pais: 'Brasil',
        complemento: null,
        principal: true,
      },
    ],
    contatos: [
      { id: 3, mecanicoId: 1, tipo: 'Celular', valor: '(11) 98888-7777', principal: true, observacao: null },
    ],
  };

  const mecanicosServiceMock = {
    get: vi.fn().mockReturnValue(of(mockMecanico)),
  };

  function setupTestBed(idParam: string | null = '1') {
    return TestBed.configureTestingModule({
      imports: [MecanicoDetalheComponent],
      providers: [
        provideRouter([]),
        { provide: MecanicosService, useValue: mecanicosServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(idParam ? { id: idParam } : {}),
              routeConfig: idParam !== null ? { path: 'mecanicos/:id' } : undefined,
            },
          },
        },
      ],
    }).compileComponents();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mecanicosServiceMock.get.mockReturnValue(of(mockMecanico));
  });

  it('deve registrar a rota mecanicos/:id após mecanicos/novo em app.routes.ts (T-016.1)', () => {
    const mainRoute = routes.find(r => r.path === '' && Array.isArray(r.children));
    expect(mainRoute).toBeTruthy();

    const children = mainRoute!.children!;
    const novoIdx = children.findIndex(r => r.path === 'mecanicos/novo');
    const detalheIdx = children.findIndex(r => r.path === 'mecanicos/:id');

    expect(novoIdx).toBeGreaterThanOrEqual(0);
    expect(detalheIdx).toBeGreaterThan(novoIdx);
    expect(children[detalheIdx].component).toBe(MecanicoDetalheComponent);
  });

  it('deve carregar os dados do mecânico via rota /mecanicos/:id e ativar modo página', async () => {
    await setupTestBed('1');

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(MecanicoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isRoutedPage).toBe(true);
    expect(mecanicosServiceMock.get).toHaveBeenCalledWith(1);
    expect(component.mecanico).toEqual(mockMecanico);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
    expect(component.initials).toBe('CS');
    expect(component.isAtivo).toBe(true);
    expect(component.primaryContact).toBe('(11) 98888-7777');
    expect(component.primaryCity).toBe('São Paulo, SP');
  });

  it('deve tratar ID inválido na rota sem chamar a API', async () => {
    await setupTestBed('invalido');

    fixture = TestBed.createComponent(MecanicoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isRoutedPage).toBe(true);
    expect(mecanicosServiceMock.get).not.toHaveBeenCalled();
    expect(component.error).toBe('ID do mecânico inválido.');
  });

  it('deve exibir erro quando a API retornar 404 para mecânico inexistente', async () => {
    mecanicosServiceMock.get.mockReturnValue(
      throwError(() => ({ error: { message: 'Mecânico não encontrado.' } }))
    );

    await setupTestBed('999');

    fixture = TestBed.createComponent(MecanicoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isRoutedPage).toBe(true);
    expect(mecanicosServiceMock.get).toHaveBeenCalledWith(999);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Mecânico não encontrado.');
  });

  it('deve navegar de volta para /mecanicos ao acionar voltar() ou close() em modo página', async () => {
    await setupTestBed('1');

    router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(MecanicoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.close();
    expect(navSpy).toHaveBeenCalledWith(['/mecanicos']);
  });
});
