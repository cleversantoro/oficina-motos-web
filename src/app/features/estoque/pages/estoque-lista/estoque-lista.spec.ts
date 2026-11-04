import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EstoqueListaComponent } from './estoque-lista';
import { EstoqueService } from '../../../../core/services/estoque.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('EstoqueListaComponent', () => {
  let fixture: ComponentFixture<EstoqueListaComponent>;
  let component: EstoqueListaComponent;

  const mockPecas = [
    {
      id: 1,
      codigo: 'PEC-001',
      descricao: 'Filtro de Óleo',
      fabricanteId: 10,
      categoriaId: 1,
      localizacaoId: 20,
      precoUnitario: 45,
      quantidade: 2,
      estoqueMinimo: 5,
      estoqueMaximo: 30,
      unidade: 'UN',
      status: 'Ativo',
      observacoes: null,
    },
    {
      id: 2,
      codigo: 'PEC-002',
      descricao: 'Vela de Ignição Iridium',
      fabricanteId: 10,
      categoriaId: 1,
      localizacaoId: 20,
      precoUnitario: 85,
      quantidade: 5,
      estoqueMinimo: 5,
      estoqueMaximo: 30,
      unidade: 'UN',
      status: 'Ativo',
      observacoes: null,
    },
  ];

  const estoqueServiceMock = {
    pecas: vi.fn().mockReturnValue(of(mockPecas)),
    categorias: vi.fn().mockReturnValue(of([{ id: 1, nome: 'Motor', descricao: null }])),
    fabricantes: vi.fn().mockReturnValue(of([{ id: 10, nome: 'NGK', cnpj: null, contato: null }])),
    localizacoes: vi.fn().mockReturnValue(of([{ id: 20, descricao: 'Prat. A1', corredor: 'A', prateleira: '1' }])),
    removerPeca: vi.fn().mockReturnValue(of(undefined)),
  };

  const authServiceMock = {
    currentRole: vi.fn().mockReturnValue('Admin'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [EstoqueListaComponent],
      providers: [
        provideRouter([]),
        { provide: EstoqueService, useValue: estoqueServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    })
      .overrideComponent(EstoqueListaComponent, {
        set: {
          providers: [{ provide: EstoqueService, useValue: estoqueServiceMock }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EstoqueListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve exibir badge de estoque crítico apenas quando quantidade < estoqueMinimo (T-018.4)', () => {
    expect(component.isCritico(mockPecas[0])).toBe(true); // 2 < 5
    expect(component.isCritico(mockPecas[1])).toBe(false); // 5 < 5 é falso

    const badges = fixture.nativeElement.querySelectorAll('.badge-critico');
    expect(badges.length).toBe(1);
    expect(badges[0].textContent.trim()).toBe('Crítico');
  });

  it('deve possuir botão + Nova peça com link para /estoque/novo (T-018.2)', () => {
    const ctaBtn = fixture.nativeElement.querySelector('button.cta.primary');
    expect(ctaBtn).toBeTruthy();
    expect(ctaBtn.getAttribute('routerlink')).toBe('/estoque/novo');
  });
});

