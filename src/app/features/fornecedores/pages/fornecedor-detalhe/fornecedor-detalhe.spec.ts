import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { FornecedorDetalhe } from './fornecedor-detalhe';

describe('FornecedorDetalhe', () => {
  let fixture: ComponentFixture<FornecedorDetalhe>;
  let component: FornecedorDetalhe;
  let router: Router;
  let svcMock: {
    get: ReturnType<typeof vi.fn>;
    representantes: ReturnType<typeof vi.fn>;
    enderecos: ReturnType<typeof vi.fn>;
    bancos: ReturnType<typeof vi.fn>;
    documentos: ReturnType<typeof vi.fn>;
    certificacoes: ReturnType<typeof vi.fn>;
    avaliacoes: ReturnType<typeof vi.fn>;
    segmentos: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    svcMock = {
      get: vi.fn().mockReturnValue(
        of({
          id: 1,
          codigo: 'FOR-1',
          tipo: 'PJ',
          razaoSocial: 'MotoPeças Brasil Ltda',
          nomeFantasia: 'MotoPeças Brasil',
          documento: '12.345.678/0001-90',
          inscricaoEstadual: null,
          inscricaoMunicipal: null,
          segmentoPrincipalId: 10,
          website: null,
          email: 'contato@motopecas.com',
          telefonePrincipal: '11999990000',
          status: 'ATIVO',
          condicaoPagamentoPadrao: '30 dias',
          prazoEntregaMedio: 2,
          notaMedia: 4.8,
          observacoes: null,
          prazoGarantiaPadrao: null,
          termosNegociados: null,
          atendimentoPersonalizado: true,
          retiradaLocal: true,
          ratingLogistica: 4.9,
          ratingQualidade: 4.7,
        }),
      ),
      representantes: vi.fn().mockReturnValue(of([])),
      enderecos: vi.fn().mockReturnValue(of([])),
      bancos: vi.fn().mockReturnValue(of([])),
      documentos: vi.fn().mockReturnValue(of([])),
      certificacoes: vi.fn().mockReturnValue(of([])),
      avaliacoes: vi.fn().mockReturnValue(of([])),
      segmentos: vi.fn().mockReturnValue(of([{ id: 10, codigo: 'SEG-1', nome: 'Peças', descricao: null, ativo: true }])),
    };

    await TestBed.configureTestingModule({
      imports: [FornecedorDetalhe],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1' }) },
          },
        },
        { provide: FornecedoresService, useValue: svcMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(FornecedorDetalhe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar dados do fornecedor e sub-recursos na inicialização', () => {
    expect(svcMock.get).toHaveBeenCalledWith(1);
    expect(component.loading).toBe(false);
    expect(component.displayName).toBe('MotoPeças Brasil');
    expect(component.segmentoPrincipalNome).toBe('Peças');
    expect(fixture.nativeElement.textContent).toContain('MotoPeças Brasil');
  });

  it('deve exibir erro quando carregamento falhar', () => {
    svcMock.get.mockReturnValueOnce(throwError(() => new Error('Erro 404')));
    component.ngOnInit();
    expect(component.loading).toBe(false);
    expect(component.error).toBeTruthy();
  });
});
