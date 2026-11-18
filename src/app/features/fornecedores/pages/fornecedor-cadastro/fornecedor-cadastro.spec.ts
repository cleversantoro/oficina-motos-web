import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FornecedorCadastroComponent } from './fornecedor-cadastro';
import { FornecedoresService } from '../../../../core/services/fornecedores.service';
import { CepService } from '../../../../shared/services/cep';
import { Toast } from '../../../../shared/services/toast';
import { routes } from '../../../../app.routes';

describe('FornecedorCadastroComponent', () => {
  let fixture: ComponentFixture<FornecedorCadastroComponent>;
  let component: FornecedorCadastroComponent;
  let router: Router;

  const mockSegmentos = [
    { id: 1, codigo: 'SEG-OEM', nome: 'Peças Originais (OEM)', descricao: null, ativo: true },
    { id: 2, codigo: 'SEG-PNE', nome: 'Pneus & Câmaras', descricao: null, ativo: true },
    { id: 3, codigo: 'SEG-INA', nome: 'Inativo', descricao: null, ativo: false },
  ];

  const mockFornecedores = [
    { id: 1, codigo: 'FOR-001', razaoSocial: 'Fornecedor A' },
    { id: 2, codigo: 'FOR-002', razaoSocial: 'Fornecedor B' },
  ];

  const mockEnderecoViaCep = {
    cep: '01001000',
    logradouro: 'Praça da Sé',
    complemento: 'lado ímpar',
    bairro: 'Sé',
    cidade: 'São Paulo',
    estado: 'São Paulo',
    uf: 'SP',
    ibge: '3550308',
    ddd: '11',
  };

  const fornecedoresServiceMock = {
    segmentos: vi.fn().mockReturnValue(of(mockSegmentos)),
    list: vi.fn().mockReturnValue(of(mockFornecedores)),
    create: vi.fn().mockReturnValue(of({ id: 15, codigo: 'FOR-003' })),
    criarEndereco: vi.fn().mockReturnValue(of({ id: 100 })),
    vincularSegmento: vi.fn().mockReturnValue(of({ id: 200 })),
  };

  const cepServiceMock = {
    buscarCep: vi.fn().mockReturnValue(of(mockEnderecoViaCep)),
  };

  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    fornecedoresServiceMock.segmentos.mockReturnValue(of(mockSegmentos));
    fornecedoresServiceMock.list.mockReturnValue(of(mockFornecedores));
    fornecedoresServiceMock.create.mockReturnValue(of({ id: 15, codigo: 'FOR-003' }));
    fornecedoresServiceMock.criarEndereco.mockReturnValue(of({ id: 100 }));
    fornecedoresServiceMock.vincularSegmento.mockReturnValue(of({ id: 200 }));
    cepServiceMock.buscarCep.mockReturnValue(of(mockEnderecoViaCep));

    await TestBed.configureTestingModule({
      imports: [FornecedorCadastroComponent],
      providers: [
        provideRouter([]),
        { provide: FornecedoresService, useValue: fornecedoresServiceMock },
        { provide: CepService, useValue: cepServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(FornecedorCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve registrar a rota fornecedores/novo antes de fornecedores/:id em app.routes.ts (T-017.2)', async () => {
    const mainRoute = routes.find((r) => r.path === '' && Array.isArray(r.children));
    expect(mainRoute).toBeTruthy();

    const children = mainRoute!.children!;
    const novoIdx = children.findIndex((r) => r.path === 'fornecedores/novo');
    const detalheIdx = children.findIndex((r) => r.path === 'fornecedores/:id');

    expect(novoIdx).toBeGreaterThanOrEqual(0);
    expect(detalheIdx).toBeGreaterThan(novoIdx);
    const loaded = children[novoIdx].component ?? (await children[novoIdx].loadComponent!());
    expect(loaded).toBe(FornecedorCadastroComponent);
  });

  it('deve inicializar o componente, sugerir código FOR-003 e carregar segmentos ativos no dropdown (T-017.1, T-017.4)', () => {
    expect(component).toBeTruthy();
    expect(component.form.controls.codigo.value).toBe('FOR-003');
    expect(component.form.controls.status.value).toBe('ATIVO');
    expect(component.form.controls.tipo.value).toBe('DISTRIBUIDOR');
    expect(component.segmentos().length).toBe(2);
    expect(component.segmentos().map((s) => s.nome)).toEqual([
      'Peças Originais (OEM)',
      'Pneus & Câmaras',
    ]);
  });

  it('deve formatar e validar CNPJ corretamente via cnpjValidator (T-017.3)', () => {
    // CNPJ inválido (dígitos repetidos)
    const invalidEvent = { target: { value: '11111111111111' } } as unknown as Event;
    component.onCnpjInput(invalidEvent);

    expect(component.form.controls.documento.value).toBe('11.111.111/1111-11');
    expect(component.form.controls.documento.invalid).toBe(true);
    expect(component.form.controls.documento.hasError('cnpj')).toBe(true);

    // CNPJ válido (11.222.333/0001-81)
    const validEvent = { target: { value: '11222333000181' } } as unknown as Event;
    component.onCnpjInput(validEvent);

    expect(component.form.controls.documento.value).toBe('11.222.333/0001-81');
    expect(component.form.controls.documento.valid).toBe(true);
  });

  it('deve consultar CepService automaticamente ao digitar 8 dígitos no CEP e autopreencher o endereço (T-017.3)', () => {
    const cepEvent = { target: { value: '01001000' } } as unknown as Event;
    component.onCepInput(cepEvent);

    expect(component.form.controls.cep.value).toBe('01001-000');
    expect(cepServiceMock.buscarCep).toHaveBeenCalledWith('01001000');
    expect(component.form.controls.logradouro.value).toBe('Praça da Sé');
    expect(component.form.controls.bairro.value).toBe('Sé');
    expect(component.form.controls.cidade.value).toBe('São Paulo');
    expect(component.form.controls.estado.value).toBe('SP');
    expect(component.form.controls.complemento.value).toBe('lado ímpar');
  });

  it('deve tratar erro quando o CEP não for encontrado no CepService', () => {
    cepServiceMock.buscarCep.mockReturnValue(
      throwError(() => new Error('CEP não encontrado'))
    );

    component.buscarCep('99999-999');

    expect(cepServiceMock.buscarCep).toHaveBeenCalledWith('99999999');
    expect(component.cepError()).toBe('CEP não encontrado');
    expect(component.searchingCep()).toBe(false);
  });

  it('deve submeter o formulário válido, criar fornecedor, endereço e vínculo de segmento, exibir toast e redirecionar', () => {
    component.form.patchValue({
      codigo: 'FOR-010',
      tipo: 'DISTRIBUIDOR',
      status: 'ATIVO',
      razaoSocial: 'Moto Peças Brasil Distribuidora Ltda',
      nomeFantasia: 'MotoBrasil',
      documento: '11.222.333/0001-81',
      segmentoPrincipalId: 1,
      email: 'contato@motobrasil.com.br',
      telefonePrincipal: '(11) 98888-7777',
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      numero: '100',
      bairro: 'Sé',
      cidade: 'São Paulo',
      estado: 'SP',
    });

    component.salvar();

    expect(fornecedoresServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        codigo: 'FOR-010',
        razaoSocial: 'Moto Peças Brasil Distribuidora Ltda',
        nomeFantasia: 'MotoBrasil',
        documento: '11222333000181',
        segmentoPrincipalId: 1,
        status: 'ATIVO',
      })
    );
    expect(fornecedoresServiceMock.criarEndereco).toHaveBeenCalledWith(
      expect.objectContaining({
        fornecedorId: 15,
        cep: '01001000',
        logradouro: 'Praça da Sé',
        cidade: 'São Paulo',
        estado: 'SP',
        principal: true,
      })
    );
    expect(fornecedoresServiceMock.vincularSegmento).toHaveBeenCalledWith({
      fornecedorId: 15,
      segmentoId: 1,
      principal: true,
      observacoes: null,
    });
    expect(toastMock.success).toHaveBeenCalledWith('Fornecedor cadastrado com sucesso!');
    expect(router.navigate).toHaveBeenCalledWith(['/fornecedores']);
  });

  it('deve exibir toast de erro quando a criação do fornecedor falhar na API', () => {
    fornecedoresServiceMock.create.mockReturnValue(
      throwError(() => ({ error: { message: 'CNPJ já cadastrado.' } }))
    );

    component.form.patchValue({
      codigo: 'FOR-010',
      razaoSocial: 'Moto Peças Brasil Ltda',
      nomeFantasia: 'MotoBrasil',
      documento: '11.222.333/0001-81',
    });

    component.salvar();

    expect(toastMock.error).toHaveBeenCalledWith('CNPJ já cadastrado.');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

