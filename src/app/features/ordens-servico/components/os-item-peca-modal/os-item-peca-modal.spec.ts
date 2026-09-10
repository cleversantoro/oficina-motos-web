import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { OsItemPecaModalComponent } from './os-item-peca-modal';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { OrdensService } from '../../../../core/services/ordens.service';
import { Toast } from '../../../../shared/services/toast';
import { EstoquePeca, OrdemServicoItem } from '../../../../core/models';

describe('OsItemPecaModalComponent', () => {
  let component: OsItemPecaModalComponent;
  let fixture: ComponentFixture<OsItemPecaModalComponent>;

  const mockPecas: EstoquePeca[] = [
    {
      id: 10,
      codigo: 'PEC-001',
      descricao: 'Filtro de Óleo Fram',
      precoUnitario: 45.5,
      quantidade: 5,
      estoqueMinimo: 2,
      estoqueMaximo: 20,
      unidade: 'UN',
      status: 'Ativo',
      fabricanteId: 1,
      categoriaId: 1,
      localizacaoId: 1,
      observacoes: null,
    },
    {
      id: 20,
      codigo: 'PEC-002',
      descricao: 'Vela de Ignição NGK',
      precoUnitario: 30.0,
      quantidade: 0,
      estoqueMinimo: 5,
      estoqueMaximo: 30,
      unidade: 'UN',
      status: 'Ativo',
      fabricanteId: 1,
      categoriaId: 1,
      localizacaoId: 1,
      observacoes: null,
    },
  ];

  const ordensServiceMock = {
    addItem: vi.fn(),
  };

  const estoqueServiceMock = {
    pecas: vi.fn().mockReturnValue(of(mockPecas)),
  };

  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [OsItemPecaModalComponent],
      providers: [
        { provide: OrdensService, useValue: ordensServiceMock },
        { provide: EstoqueService, useValue: estoqueServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OsItemPecaModalComponent);
    component = fixture.componentInstance;
    component.ordemServicoId = 123;
    component.visible = true;
    fixture.detectChanges();
  });

  it('deve inicializar com valores padrão', () => {
    expect(component).toBeTruthy();
    expect(component.quantidade()).toBe(1);
    expect(component.valorUnitario()).toBe(0);
    expect(component.subtotal()).toBe(0);
    expect(component.isValido()).toBe(false);
  });

  it('deve filtrar peças a partir de 2 caracteres digitados', () => {
    component.buscarPecas('filtro');
    expect(estoqueServiceMock.pecas).toHaveBeenCalled();
    expect(component.pecasSugeridas().length).toBe(1);
    expect(component.pecasSugeridas()[0].codigo).toBe('PEC-001');
  });

  it('não deve consultar estoque quando termo for menor que 2 caracteres', () => {
    component.buscarPecas('a');
    expect(component.pecasSugeridas().length).toBe(0);
    expect(estoqueServiceMock.pecas).not.toHaveBeenCalled();
  });

  it('deve pré-preencher descrição e preço ao selecionar uma peça', () => {
    component.selecionarPeca(mockPecas[0]);
    expect(component.pecaSelecionada()).toEqual(mockPecas[0]);
    expect(component.descricao()).toBe('PEC-001 - Filtro de Óleo Fram');
    expect(component.valorUnitario()).toBe(45.5);
    expect(component.subtotal()).toBe(45.5);
    expect(component.isValido()).toBe(true);
  });

  it('deve calcular subtotal dinamicamente ao alterar quantidade', () => {
    component.selecionarPeca(mockPecas[0]);
    component.quantidade.set(3);
    expect(component.subtotal()).toBe(136.5);
  });

  it('deve limpar campos ao invocar limparPeca()', () => {
    component.selecionarPeca(mockPecas[0]);
    component.limparPeca();
    expect(component.pecaSelecionada()).toBeNull();
    expect(component.descricao()).toBe('');
    expect(component.valorUnitario()).toBe(0);
    expect(component.subtotal()).toBe(0);
    expect(component.isValido()).toBe(false);
  });

  it('deve submeter item com sucesso e emitir itemAdded', () => {
    const itemCriado: OrdemServicoItem = {
      id: 99,
      ordemServicoId: 123,
      pecaId: 10,
      descricao: 'PEC-001 - Filtro de Óleo Fram',
      quantidade: 2,
      valorUnitario: 45.5,
      total: 91.0,
    };
    ordensServiceMock.addItem.mockReturnValue(of(itemCriado));

    const itemAddedSpy = vi.spyOn(component.itemAdded, 'emit');
    const visibleChangeSpy = vi.spyOn(component.visibleChange, 'emit');

    component.selecionarPeca(mockPecas[0]);
    component.quantidade.set(2);
    component.salvar();

    expect(ordensServiceMock.addItem).toHaveBeenCalledWith({
      ordemServicoId: 123,
      pecaId: 10,
      descricao: 'PEC-001 - Filtro de Óleo Fram',
      quantidade: 2,
      valorUnitario: 45.5,
    });
    expect(itemAddedSpy).toHaveBeenCalledWith(itemCriado);
    expect(toastMock.success).toHaveBeenCalled();
    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });

  it('deve tratar erro na API ao salvar peça', () => {
    ordensServiceMock.addItem.mockReturnValue(throwError(() => new Error('Falha API')));
    component.selecionarPeca(mockPecas[0]);
    component.salvar();

    expect(toastMock.error).toHaveBeenCalled();
    expect(component.submitting()).toBe(false);
  });
});
