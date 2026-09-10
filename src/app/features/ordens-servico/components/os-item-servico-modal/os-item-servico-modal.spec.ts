import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { OsItemServicoModalComponent } from './os-item-servico-modal';
import { OrdensService } from '../../../../core/services/ordens.service';
import { Toast } from '../../../../shared/services/toast';
import { OrdemServicoItem } from '../../../../core/models';

describe('OsItemServicoModalComponent', () => {
  let component: OsItemServicoModalComponent;
  let fixture: ComponentFixture<OsItemServicoModalComponent>;

  const ordensServiceMock = {
    addItem: vi.fn(),
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
      imports: [OsItemServicoModalComponent],
      providers: [
        { provide: OrdensService, useValue: ordensServiceMock },
        { provide: Toast, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OsItemServicoModalComponent);
    component = fixture.componentInstance;
    component.ordemServicoId = 456;
    component.visible = true;
    fixture.detectChanges();
  });

  it('deve inicializar com valores padrão', () => {
    expect(component).toBeTruthy();
    expect(component.descricao()).toBe('');
    expect(component.quantidade()).toBe(1);
    expect(component.valorUnitario()).toBe(0);
    expect(component.subtotal()).toBe(0);
    expect(component.isValido()).toBe(false);
    expect(component.caracteresRestantes()).toBe(240);
  });

  it('deve calcular caracteres restantes dinamicamente', () => {
    component.descricao.set('Revisão geral de freios');
    expect(component.caracteresRestantes()).toBe(240 - 'Revisão geral de freios'.length);
  });

  it('deve validar formulário quando descrição preenchida e valores válidos', () => {
    component.descricao.set('Limpeza de bicos injetores');
    component.quantidade.set(1);
    component.valorUnitario.set(150.0);

    expect(component.isValido()).toBe(true);
    expect(component.subtotal()).toBe(150.0);
  });

  it('deve submeter serviço com sucesso, pecaId null e emitir itemAdded', () => {
    const itemCriado: OrdemServicoItem = {
      id: 88,
      ordemServicoId: 456,
      pecaId: null,
      descricao: 'Limpeza de bicos injetores',
      quantidade: 1,
      valorUnitario: 150.0,
      total: 150.0,
    };
    ordensServiceMock.addItem.mockReturnValue(of(itemCriado));

    const itemAddedSpy = vi.spyOn(component.itemAdded, 'emit');
    const visibleChangeSpy = vi.spyOn(component.visibleChange, 'emit');

    component.descricao.set('Limpeza de bicos injetores');
    component.quantidade.set(1);
    component.valorUnitario.set(150.0);
    component.salvar();

    expect(ordensServiceMock.addItem).toHaveBeenCalledWith({
      ordemServicoId: 456,
      pecaId: null,
      descricao: 'Limpeza de bicos injetores',
      quantidade: 1,
      valorUnitario: 150.0,
    });
    expect(itemAddedSpy).toHaveBeenCalledWith(itemCriado);
    expect(toastMock.success).toHaveBeenCalled();
    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });

  it('deve tratar erro na API ao salvar serviço', () => {
    ordensServiceMock.addItem.mockReturnValue(throwError(() => new Error('Erro API')));

    component.descricao.set('Troca de fluido');
    component.quantidade.set(1);
    component.valorUnitario.set(80.0);
    component.salvar();

    expect(toastMock.error).toHaveBeenCalled();
    expect(component.submitting()).toBe(false);
  });

  it('deve resetar campos ao invocar fechar()', () => {
    component.descricao.set('Troca de vela');
    component.valorUnitario.set(40.0);
    component.fechar();

    expect(component.descricao()).toBe('');
    expect(component.valorUnitario()).toBe(0);
    expect(component.quantidade()).toBe(1);
    expect(component.isValido()).toBe(false);
  });
});
