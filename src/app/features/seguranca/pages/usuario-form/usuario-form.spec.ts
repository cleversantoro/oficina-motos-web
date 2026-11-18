import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SegurancaService } from '../../../../core/services/seguranca.service';
import { Toast } from '../../../../shared/services/toast';
import { UsuarioFormComponent } from './usuario-form';

describe('UsuarioFormComponent', () => {
  let fixture: ComponentFixture<UsuarioFormComponent>;
  let component: UsuarioFormComponent;
  let segurancaMock: {
    listarPerfis: ReturnType<typeof vi.fn>;
    obterUsuario: ReturnType<typeof vi.fn>;
    criarUsuario: ReturnType<typeof vi.fn>;
    atualizarUsuario: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const setup = async (id: string | null = null) => {
    segurancaMock = {
      listarPerfis: vi.fn().mockReturnValue(of([{ id: 1, nome: 'Administrador', nivel: 1, status: 1, permissoes: [] }])),
      obterUsuario: vi.fn().mockReturnValue(of({
        id: 5,
        nome: 'Maria',
        login: 'maria',
        email: 'maria@oficina.com',
        telefone: '11999999999',
        status: 1,
        statusDescricao: 'Ativo',
        perfis: [{ id: 1, nome: 'Administrador', nivel: 1 }],
      })),
      criarUsuario: vi.fn().mockReturnValue(of({ id: 10 })),
      atualizarUsuario: vi.fn().mockReturnValue(of({ id: 5 })),
    };

    await TestBed.configureTestingModule({
      imports: [UsuarioFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(id ? { id } : {}) },
          },
        },
        { provide: SegurancaService, useValue: segurancaMock },
        { provide: Toast, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(UsuarioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('deve criar novo usuário quando formulário válido em modo criação', async () => {
    await setup(null);
    expect(component.isEditMode()).toBe(false);

    component.form.patchValue({
      nome: 'João',
      login: 'joao',
      email: 'joao@oficina.com',
      senha: 'Password@123',
      perfilId: 1,
    });

    component.salvar();

    expect(segurancaMock.criarUsuario).toHaveBeenCalledWith({
      nome: 'João',
      login: 'joao',
      email: 'joao@oficina.com',
      senha: 'Password@123',
      telefone: null,
      perfilId: 1,
    });
  });

  it('deve carregar usuário e atualizar quando em modo edição', async () => {
    await setup('5');
    expect(component.isEditMode()).toBe(true);
    expect(segurancaMock.obterUsuario).toHaveBeenCalledWith(5);
    expect(component.form.controls.nome.value).toBe('Maria');

    component.form.patchValue({ nome: 'Maria Silva' });
    component.salvar();

    expect(segurancaMock.atualizarUsuario).toHaveBeenCalledWith(5, {
      nome: 'Maria Silva',
      login: 'maria',
      email: 'maria@oficina.com',
      telefone: '11999999999',
      status: 1,
      perfilId: 1,
    });
  });
});
