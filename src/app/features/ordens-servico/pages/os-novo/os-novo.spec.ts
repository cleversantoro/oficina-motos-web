import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { OsCadastroComponent } from './os-novo';
import { ClientesService } from '../../../../core/services/clientes.service';
import { VeiculosService } from '../../../../core/services/veiculos.service';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { OrdensService } from '../../../../core/services/ordens.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Toast } from '../../../../shared/services/toast';

describe('OsCadastroComponent', () => {
  let fixture: ComponentFixture<OsCadastroComponent>;
  let component: OsCadastroComponent;
  let clienteBuscas: Subject<unknown>[];
  let navegacoes: unknown[][];
  let veiculoRespostas: Subject<unknown>[];
  let mecanicoRespostas: Subject<unknown>[];
  let criacoes: Subject<unknown>[];
  let avisos: string[];

  beforeEach(async () => {
    clienteBuscas = [];
    navegacoes = [];
    veiculoRespostas = [];
    mecanicoRespostas = [];
    criacoes = [];
    avisos = [];
    await TestBed.configureTestingModule({
      imports: [OsCadastroComponent],
      providers: [
        { provide: ClientesService, useValue: { search: () => { const busca = new Subject<unknown>(); clienteBuscas.push(busca); return busca.asObservable(); } } },
        { provide: VeiculosService, useValue: { listByCliente: () => { const resposta = new Subject<unknown>(); veiculoRespostas.push(resposta); return resposta.asObservable(); } } },
        { provide: MecanicosService, useValue: { getAll: () => { const resposta = new Subject<unknown>(); mecanicoRespostas.push(resposta); return resposta.asObservable(); } } },
        { provide: OrdensService, useValue: { create: () => { const criacao = new Subject<unknown>(); criacoes.push(criacao); return criacao.asObservable(); } } },
        { provide: AuthService, useValue: { permissions: () => ['ordens:criar'], currentRole: () => 'Recepcionista' } },
        { provide: Router, useValue: { navigate: (...commands: unknown[]) => { navegacoes.push(commands); return Promise.resolve(true); } } },
        provideRouter([]),
        { provide: Toast, useValue: { warn: (_summary: string, detail: string) => avisos.push(detail), error: (_summary: string, detail: string) => avisos.push(detail) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OsCadastroComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('inicia com os campos obrigatórios inválidos', () => {
    expect(component.form.invalid).toBe(true);
    expect(component.canCreate()).toBe(true);
  });

  it('limpa o veículo ao selecionar um cliente', () => {
    component.form.controls.veiculoId.setValue(99);
    component.selectCliente({ id: 7, nome: 'Cliente Teste' });

    expect(component.form.controls.clienteId.value).toBe(7);
    expect(component.form.controls.veiculoId.value).toBe(0);
  });

  it('carrega somente veículos do cliente selecionado', () => {
    component.selectCliente({ id: 7, nome: 'Cliente Teste' });
    veiculoRespostas[0].next([{ id: 11, placa: 'ABC1234' }]);

    expect(component.veiculos()).toEqual([{ id: 11, placa: 'ABC1234' }]);
  });

  it('mantém erro quando a consulta de veículos falha', () => {
    component.selectCliente({ id: 7, nome: 'Cliente Teste' });
    veiculoRespostas[0].error(new Error('falha'));

    expect(component.errorMessage()).toContain('veículos');
  });

  it('bloqueia submissão incompleta', () => {
    component.submit();

    expect(component.submitting()).toBe(false);
  });

  it('ignora a resposta de uma busca anterior', () => {
    component.searchClientes('ana');
    component.searchClientes('bruna');

    clienteBuscas[0].next([{ id: 1, nome: 'Ana' }]);
    clienteBuscas[1].next([{ id: 2, nome: 'Bruna' }]);

    expect(component.clientes()).toEqual([{ id: 2, nome: 'Bruna' }]);
  });

  it('navega para a ordem criada com ID válido', () => {
    component.form.setValue({ clienteId: 1, veiculoId: 2, descricaoProblema: 'Teste', mecanicoId: 3 });
    component.submit();
    criacoes[0].next({ id: 1 });

    expect(navegacoes).toEqual([[['/ordens', 1]]]);
  });

  it('bloqueia uma segunda submissão enquanto a primeira está pendente', () => {
    component.form.setValue({ clienteId: 1, veiculoId: 2, descricaoProblema: 'Teste', mecanicoId: 3 });
    component.submit();
    component.submit();

    expect(criacoes.length).toBe(1);
  });

  it('exibe erro sem navegar quando a criação falha', () => {
    component.form.setValue({ clienteId: 1, veiculoId: 2, descricaoProblema: 'Teste', mecanicoId: 3 });
    component.submit();
    criacoes[0].error(new Error('falha'));

    expect(component.errorMessage()).toContain('criar');
    expect(navegacoes).toEqual([]);
  });

  it('nega o envio quando a permissão é perdida', () => {
    const auth = TestBed.inject(AuthService) as unknown as {
      permissions: () => string[];
      currentRole: () => string | null;
    };
    auth.permissions = () => [];
    auth.currentRole = () => null;
    component.form.setValue({ clienteId: 1, veiculoId: 2, descricaoProblema: 'Teste', mecanicoId: 3 });
    component.submit();

    expect(criacoes.length).toBe(0);
    expect(avisos).toContain('Você não tem permissão para acessar esta área.');
  });
});
