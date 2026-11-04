import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EstoquePecaCadastroComponent } from './estoque-peca-cadastro';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { Toast } from '../../../../shared/services/toast';
import { routes } from '../../../../app.routes';

describe('EstoquePecaCadastroComponent', () => {
  let fixture: ComponentFixture<EstoquePecaCadastroComponent>;
  let component: EstoquePecaCadastroComponent;
  let router: Router;

  const mockCategorias = [
    { id: 1, nome: 'Freios', descricao: null },
    { id: 2, nome: 'Transmissão', descricao: null },
  ];

  const mockFabricantes = [
    { id: 10, nome: 'Cobreq', cnpj: null, contato: null },
    { id: 11, nome: 'DID', cnpj: null, contato: null },
  ];

  const mockLocalizacoes = [
    { id: 20, descricao: 'Corredor A - Prat. 1', corredor: 'A', prateleira: '1' },
  ];

  const mockFornecedores = [
    { id: 30, codigo: 'FOR-001', razaoSocial: 'Moto Peças Ltda', nomeFantasia: 'MotoPeças', status: 'ATIVO' },
    { id: 31, codigo: 'FOR-002', razaoSocial: 'Inativo Ltda', nomeFantasia: 'Inativo', status: 'INATIVO' },
  ];

  const mockPecas = [
    { id: 1, codigo: 'PEC-001' },
    { id: 2, codigo: 'PEC-002' },
  ];

  const estoqueServiceMock = {
    categorias: vi.fn().mockReturnValue(of(mockCategorias)),
    fabricantes: vi.fn().mockReturnValue(of(mockFabricantes)),
    localizacoes: vi.fn().mockReturnValue(of(mockLocalizacoes)),
    pecas: vi.fn().mockReturnValue(of(mockPecas)),
    criarPeca: vi.fn().mockReturnValue(of({ id: 50, codigo: 'PEC-003' })),
    vincularFornecedor: vi.fn().mockReturnValue(of({ id: 99 })),
  };

  const fornecedoresServiceMock = {
    list: vi.fn().mockReturnValue(of(mockFornecedores)),
  };

  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    estoqueServiceMock.categorias.mockReturnValue(of(mockCategorias));
    estoqueServiceMock.fabricantes.mockReturnValue(of(mockFabricantes));
    estoqueServiceMock.localizacoes.mockReturnValue(of(mockLocalizacoes));
    estoqueServiceMock.pecas.mockReturnValue(of(mockPecas));
    estoqueServiceMock.criarPeca.mockReturnValue(of({ id: 50, codigo: 'PEC-003' }));
    estoqueServiceMock.vincularFornecedor.mockReturnValue(of({ id: 99 }));
    fornecedoresServiceMock.list.mockReturnValue(of(mockFornecedores));

    await TestBed.configureTestingModule({
      imports: [EstoquePecaCadastroComponent],
      providers: [
        provideRouter([]),
        { provide: EstoqueService, useValue: estoqueServiceMock },
        { provide: FornecedoresService, useValue: fornecedoresServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(EstoquePecaCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve registrar a rota estoque/novo em app.routes.ts (T-018.2)', () => {
    const mainRoute = routes.find((r) => r.path === '' && Array.isArray(r.children));
    expect(mainRoute).toBeTruthy();

    const novoRoute = mainRoute!.children!.find((r) => r.path === 'estoque/novo');
    expect(novoRoute).toBeTruthy();
    expect(novoRoute!.component).toBe(EstoquePecaCadastroComponent);
  });

  it('deve inicializar o formulário e carregar dropdowns de fabricante, categoria e fornecedor (T-018.1, T-018.3)', () => {
    expect(component).toBeTruthy();
    expect(component.form.controls.codigo.value).toBe('PEC-003');
    expect(component.form.controls.unidade.value).toBe('UN');
    expect(component.form.controls.status.value).toBe('Ativo');
    expect(component.categorias().length).toBe(2);
    expect(component.fabricantes().length).toBe(2);
    expect(component.localizacoes().length).toBe(1);
    expect(component.fornecedores().length).toBe(1);
    expect(component.fornecedores()[0].nomeFantasia).toBe('MotoPeças');
  });

  it('deve validar formulário como inválido quando campos obrigatórios não estão preenchidos', () => {
    expect(component.form.invalid).toBe(true);
    component.salvar();
    expect(estoqueServiceMock.criarPeca).not.toHaveBeenCalled();
  });

  it('deve criar a peça e vincular o fornecedor selecionado ao submeter formulário válido', () => {
    component.form.patchValue({
      codigo: 'PEC-010',
      descricao: 'Pastilha de Freio Dianteira Cobreq',
      unidade: 'PAR',
      status: 'Ativo',
      categoriaId: 1,
      fabricanteId: 10,
      fornecedorId: 30,
      localizacaoId: 20,
      precoUnitario: 68.5,
      precoFornecedor: 39.9,
      prazoEntregaFornecedor: 3,
      quantidade: 12,
      estoqueMinimo: 5,
      estoqueMaximo: 40,
      observacoes: 'Honda CB 300F',
    });

    component.salvar();

    expect(estoqueServiceMock.criarPeca).toHaveBeenCalledWith({
      codigo: 'PEC-010',
      descricao: 'Pastilha de Freio Dianteira Cobreq',
      fabricanteId: 10,
      categoriaId: 1,
      localizacaoId: 20,
      precoUnitario: 68.5,
      quantidade: 12,
      estoqueMinimo: 5,
      estoqueMaximo: 40,
      unidade: 'PAR',
      status: 'Ativo',
      observacoes: 'Honda CB 300F',
    });
    expect(estoqueServiceMock.vincularFornecedor).toHaveBeenCalledWith({
      pecaId: 50,
      fornecedorId: 30,
      preco: 39.9,
      prazoEntrega: 3,
      observacao: 'Fornecedor vinculado no cadastro da peça',
    });
    expect(toastMock.success).toHaveBeenCalledWith('Peça cadastrada no estoque com sucesso!');
    expect(router.navigate).toHaveBeenCalledWith(['/estoque']);
  });

  it('deve exibir toast de erro quando a API falhar ao salvar a peça', () => {
    estoqueServiceMock.criarPeca.mockReturnValue(
      throwError(() => ({ error: { message: 'Código SKU já cadastrado.' } }))
    );

    component.form.patchValue({
      codigo: 'PEC-001',
      descricao: 'Filtro de Ar',
      precoUnitario: 35,
      quantidade: 5,
      estoqueMinimo: 2,
      estoqueMaximo: 20,
    });

    component.salvar();

    expect(toastMock.error).toHaveBeenCalledWith('Código SKU já cadastrado.');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

