import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../core/auth/auth.service';
import { Fornecedor } from '../../../../core/models/fornecedor';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { FornecedorLista } from './fornecedor-lista';

describe('FornecedorLista', () => {
  let fixture: ComponentFixture<FornecedorLista>;
  let component: FornecedorLista;
  let router: Router;
  let fornecedoresSvcMock: {
    list: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let confirmationMock: { confirmDelete: ReturnType<typeof vi.fn> };
  let toastMock: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let currentRole: string | null;

  const buildFornecedor = (id: number, overrides: Partial<Fornecedor> = {}): Fornecedor => ({
    id,
    codigo: `FOR-${id}`,
    tipo: 'PJ',
    razaoSocial: `Fornecedor ${id} Ltda`,
    nomeFantasia: `Parceiro ${id}`,
    documento: `12.345.678/000${id}-90`,
    inscricaoEstadual: null,
    inscricaoMunicipal: null,
    segmentoPrincipalId: null,
    website: null,
    email: `contato${id}@fornecedor.com`,
    telefonePrincipal: `(11) 9999-000${id}`,
    status: 'ATIVO',
    condicaoPagamentoPadrao: null,
    prazoEntregaMedio: 3,
    notaMedia: 4.5,
    observacoes: null,
    prazoGarantiaPadrao: null,
    termosNegociados: null,
    atendimentoPersonalizado: true,
    retiradaLocal: true,
    ratingLogistica: 4.5,
    ratingQualidade: 4.5,
    ...overrides,
  });

  const mockList: Fornecedor[] = [
    buildFornecedor(1, { nomeFantasia: 'MotoPeças Brasil', status: 'ATIVO', notaMedia: 5 }),
    buildFornecedor(2, { nomeFantasia: 'Lubrificantes Sul', status: 'INATIVO', notaMedia: 3 }),
    buildFornecedor(3, { nomeFantasia: 'Freios Express', status: 'SUSPENSO', notaMedia: null }),
  ];

  beforeEach(async () => {
    currentRole = 'Administrador';
    fornecedoresSvcMock = {
      list: vi.fn().mockReturnValue(of(mockList)),
      delete: vi.fn().mockReturnValue(of(null)),
    };
    confirmationMock = {
      confirmDelete: vi.fn().mockResolvedValue(true),
    };
    toastMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FornecedorLista],
      providers: [
        provideRouter([]),
        { provide: FornecedoresService, useValue: fornecedoresSvcMock },
        { provide: AuthService, useValue: { currentRole: () => currentRole } },
        { provide: Confirmation, useValue: confirmationMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(FornecedorLista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar fornecedores e calcular KPIs de resumo', () => {
    expect(fornecedoresSvcMock.list).toHaveBeenCalledTimes(1);
    expect(component.totalFornecedores()).toBe(3);
    expect(component.totalAtivos()).toBe(1);
    expect(component.totalInativosOuSuspensos()).toBe(2);
    expect(component.notaMediaGeral()).toBe(4);
    expect(fixture.nativeElement.textContent).toContain('MotoPeças Brasil');
  });

  it('deve filtrar por texto e por status e limpar filtros', () => {
    component.setStatusFilter('ATIVO');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].id).toBe(1);

    component.setStatusFilter('TODOS');
    component.onSearchChange('lubrificantes');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].id).toBe(2);

    component.clearFilters();
    expect(component.filtered().length).toBe(3);
  });

  it('deve navegar para o detalhe do fornecedor ao chamar openDetalhe', () => {
    component.openDetalhe(2);
    expect(router.navigate).toHaveBeenCalledWith(['/fornecedores', 2]);
  });

  it('deve confirmar exclusão usando Confirmation e Toast sem usar confirm/alert nativos', async () => {
    await component.confirmDelete(mockList[0]);

    expect(confirmationMock.confirmDelete).toHaveBeenCalledWith('MotoPeças Brasil');
    expect(fornecedoresSvcMock.delete).toHaveBeenCalledWith(1);
    expect(component.fornecedores().length).toBe(2);
    expect(toastMock.success).toHaveBeenCalled();
  });

  it('deve exibir estado de erro quando a listagem falhar', () => {
    fornecedoresSvcMock.list.mockReturnValueOnce(throwError(() => new Error('Erro 500')));
    component.load();
    fixture.detectChanges();

    expect(component.error()).toBe('Não foi possível carregar a lista de fornecedores.');
    expect(fixture.nativeElement.textContent).toContain('Tentar novamente');
  });
});
