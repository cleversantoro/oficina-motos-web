import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MecanicoCadastroComponent } from './mecanico-cadastro';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { Toast } from '../../../../shared/services/toast';

describe('MecanicoCadastroComponent', () => {
  let fixture: ComponentFixture<MecanicoCadastroComponent>;
  let component: MecanicoCadastroComponent;
  let router: Router;

  const mockEspecialidades = [
    { id: 1, codigo: 'ESP-INJ', nome: 'Injeção Eletrônica', descricao: null, ativo: true },
    { id: 2, codigo: 'ESP-MOT', nome: 'Motor & Câmbio', descricao: null, ativo: true },
    { id: 3, codigo: 'ESP-SUS', nome: 'Suspensão & Freios', descricao: null, ativo: true },
  ];

  const mockMecanicos = [
    { id: 1, codigo: 'MEC-001', nome: 'João', documentoPrincipal: '52998224725' } as any,
    { id: 2, codigo: 'MEC-002', nome: 'Maria', documentoPrincipal: '98765432100' } as any,
  ];

  const mecanicosServiceMock = {
    especialidades: vi.fn().mockReturnValue(of(mockEspecialidades)),
    getAll: vi.fn().mockReturnValue(of(mockMecanicos)),
    create: vi.fn(),
    vincularEspecialidade: vi.fn().mockReturnValue(of({ id: 10 })),
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
      imports: [MecanicoCadastroComponent],
      providers: [
        { provide: MecanicosService, useValue: mecanicosServiceMock },
        { provide: Toast, useValue: toastMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(MecanicoCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado com sucesso e inicializar com dados padrão', () => {
    expect(component).toBeTruthy();
    expect(component.form.get('status')?.value).toBe('Ativo');
    expect(component.form.get('nivel')?.value).toBe('Pleno');
    expect(component.form.get('cargaHorariaSemanal')?.value).toBe(44);
    expect(component.form.get('codigo')?.value).toBe('MEC-003');
    expect(component.especialidades().length).toBe(3);
  });

  it('deve validar formulário como inválido inicialmente', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('deve formatar CPF e validar unicidade', () => {
    // Digitar CPF que já existe
    const inputEvent = { target: { value: '52998224725' } } as unknown as Event;
    component.onCpfInput(inputEvent);

    expect(component.form.controls.documentoPrincipal.value).toBe('529.982.247-25');
    expect(component.form.controls.documentoPrincipal.invalid).toBe(true);
    expect(component.form.controls.documentoPrincipal.hasError('cpfDuplicado')).toBe(true);

    // Digitar CPF válido e não cadastrado (12345678909)
    const secondInputEvent = { target: { value: '12345678909' } } as unknown as Event;
    component.onCpfInput(secondInputEvent);

    expect(component.form.controls.documentoPrincipal.value).toBe('123.456.789-09');
    expect(component.form.controls.documentoPrincipal.valid).toBe(true);
  });

  it('deve gerenciar seleção de especialidades e definir a primeira como principal', () => {
    expect(component.especialidadesSelecionadas()).toEqual([]);
    expect(component.especialidadePrincipalId()).toBeNull();

    // Seleciona primeira especialidade
    component.toggleEspecialidade(1);
    expect(component.isEspecialidadeSelected(1)).toBe(true);
    expect(component.isEspecialidadePrincipal(1)).toBe(true);
    expect(component.especialidadePrincipalId()).toBe(1);

    // Seleciona segunda especialidade (a principal ainda deve ser a 1)
    component.toggleEspecialidade(2);
    expect(component.isEspecialidadeSelected(2)).toBe(true);
    expect(component.isEspecialidadePrincipal(2)).toBe(false);
    expect(component.especialidadePrincipalId()).toBe(1);

    // Define a segunda como principal
    component.setPrincipal(2);
    expect(component.isEspecialidadePrincipal(2)).toBe(true);
    expect(component.isEspecialidadePrincipal(1)).toBe(false);

    // Desmarca a primeira
    component.toggleEspecialidade(1);
    expect(component.isEspecialidadeSelected(1)).toBe(false);
    expect(component.isEspecialidadePrincipal(2)).toBe(true);

    // Desmarca a segunda (principal fica null)
    component.toggleEspecialidade(2);
    expect(component.isEspecialidadeSelected(2)).toBe(false);
    expect(component.especialidadePrincipalId()).toBeNull();
  });

  it('não deve salvar se o formulário for inválido', () => {
    component.salvar();

    expect(component.form.touched).toBe(true);
    expect(toastMock.error).toHaveBeenCalledWith(
      'Formulário incompleto',
      expect.any(String)
    );
    expect(mecanicosServiceMock.create).not.toHaveBeenCalled();
  });

  it('deve salvar com sucesso e vincular especialidades selecionadas', () => {
    mecanicosServiceMock.create.mockReturnValue(of({ id: 99, nome: 'Pedro' }));

    component.form.controls.codigo.setValue('MEC-003');
    component.form.controls.nome.setValue('Pedro');
    component.form.controls.sobrenome.setValue('Alves');
    component.form.controls.documentoPrincipal.setValue('123.456.789-09');
    component.form.controls.dataAdmissao.setValue('2026-09-13');
    component.form.controls.status.setValue('Ativo');
    component.form.controls.nivel.setValue('Senior');
    component.form.controls.valorHora.setValue(95.5);
    component.form.controls.cargaHorariaSemanal.setValue(40);
    component.form.controls.observacoes.setValue('Especialista renomado');

    // Seleciona especialidades 1 e 3, definindo 3 como principal
    component.toggleEspecialidade(1);
    component.toggleEspecialidade(3);
    component.setPrincipal(3);

    expect(component.form.valid).toBe(true);

    component.salvar();

    expect(mecanicosServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        codigo: 'MEC-003',
        nome: 'Pedro',
        sobrenome: 'Alves',
        documentoPrincipal: '12345678909',
        nivel: 'Senior',
        valorHora: 95.5,
        cargaHorariaSemanal: 40,
        especialidadePrincipalId: 3,
      })
    );

    // Deve ter chamado vinculação para as duas especialidades
    expect(mecanicosServiceMock.vincularEspecialidade).toHaveBeenCalledTimes(2);
    expect(toastMock.success).toHaveBeenCalledWith(
      'Mecânico cadastrado',
      expect.stringContaining('Pedro')
    );
    expect(router.navigate).toHaveBeenCalledWith(['/mecanicos']);
  });

  it('deve exibir toast de erro se a criação falhar', () => {
    mecanicosServiceMock.create.mockReturnValue(
      throwError(() => ({ error: { message: 'Erro ao cadastrar mecânico no servidor.' } }))
    );

    component.form.controls.codigo.setValue('MEC-003');
    component.form.controls.nome.setValue('Pedro');
    component.form.controls.documentoPrincipal.setValue('123.456.789-09');
    component.form.controls.dataAdmissao.setValue('2026-09-13');
    component.form.controls.valorHora.setValue(95.5);

    component.salvar();

    expect(component.submitting()).toBe(false);
    expect(toastMock.error).toHaveBeenCalledWith(
      'Erro ao cadastrar',
      'Erro ao cadastrar mecânico no servidor.'
    );
  });
});
