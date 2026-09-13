import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VeiculoCadastroComponent } from './veiculo-cadastro';
import { VeiculosService } from '../../../../core/services/veiculos.service';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Toast } from '../../../../shared/services/toast';

describe('VeiculoCadastroComponent', () => {
  let fixture: ComponentFixture<VeiculoCadastroComponent>;
  let component: VeiculoCadastroComponent;

  let router: Router;

  const marcasMock = [
    { id: 1, nome: 'Honda' },
    { id: 2, nome: 'Yamaha' },
  ];

  const modelosMock = [
    { id: 10, marcaId: 1, nome: 'CG 160 Titan' },
    { id: 11, marcaId: 1, nome: 'CB 500F' },
    { id: 20, marcaId: 2, nome: 'FZ25 Fazer' },
  ];

  const clientesMock = [
    { id: 5, nome: 'João da Silva', documento: '123.456.789-00' },
    { id: 8, nome: 'Maria Souza', documento: '987.654.321-11' },
  ];

  const veiculosServiceMock = {
    marcas: vi.fn().mockReturnValue(of(marcasMock)),
    modelos: vi.fn().mockReturnValue(of(modelosMock)),
    create: vi.fn(),
  };

  const clientesServiceMock = {
    search: vi.fn().mockReturnValue(of(clientesMock)),
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
      imports: [VeiculoCadastroComponent],
      providers: [
        { provide: VeiculosService, useValue: veiculosServiceMock },
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: Toast, useValue: toastMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(VeiculoCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar com formulário inválido', () => {
    expect(component).toBeTruthy();
    expect(component.form.invalid).toBe(true);
    expect(component.submitting()).toBe(false);
  });

  it('deve carregar marcas e modelos na inicialização', () => {
    expect(veiculosServiceMock.marcas).toHaveBeenCalledTimes(1);
    expect(veiculosServiceMock.modelos).toHaveBeenCalledTimes(1);
    expect(component.marcas()).toEqual(marcasMock);
    expect(component.todosModelos()).toEqual(modelosMock);
  });

  it('deve filtrar modelos ao selecionar uma marca e habilitar modeloId', () => {
    const event = { target: { value: '1' } } as unknown as Event;
    component.onMarcaChange(event);

    expect(component.form.controls.marcaId.value).toBe(1);
    expect(component.form.controls.modeloId.enabled).toBe(true);
    expect(component.modelosFiltrados().length).toBe(2);
    expect(component.modelosFiltrados()[0].nome).toBe('CG 160 Titan');
  });

  it('deve desabilitar modeloId e esvaziar modelos ao desmarcar a marca', () => {
    // Primeiro seleciona
    component.onMarcaChange({ target: { value: '1' } } as unknown as Event);
    expect(component.modelosFiltrados().length).toBe(2);

    // Agora desmarca
    component.onMarcaChange({ target: { value: '0' } } as unknown as Event);
    expect(component.form.controls.marcaId.value).toBe(0);
    expect(component.form.controls.modeloId.disabled).toBe(true);
    expect(component.modelosFiltrados().length).toBe(0);
  });

  it('deve converter placa para maiúsculas no input', () => {
    const inputEvent = { target: { value: 'bra2e19' } } as unknown as Event;
    component.onPlacaInput(inputEvent);

    expect(component.form.controls.placa.value).toBe('BRA2E19');
  });

  it('deve converter chassi para maiúsculas no input', () => {
    const inputEvent = { target: { value: '9c2jd08107r000001' } } as unknown as Event;
    component.onChassiInput(inputEvent);

    expect(component.form.controls.chassi.value).toBe('9C2JD08107R000001');
  });

  it('deve buscar clientes quando o termo tem 2 ou mais caracteres', () => {
    component.searchClientes('jo');

    expect(clientesServiceMock.search).toHaveBeenCalledWith('jo');
    expect(component.sugestoesClientes()).toEqual(clientesMock);
  });

  it('não deve buscar clientes quando o termo tem menos de 2 caracteres', () => {
    component.searchClientes('j');

    expect(clientesServiceMock.search).not.toHaveBeenCalled();
    expect(component.sugestoesClientes()).toEqual([]);
  });

  it('deve selecionar um cliente e atualizar o controle clienteId', () => {
    component.selectCliente(clientesMock[0]);

    expect(component.form.controls.clienteId.value).toBe(5);
    expect(component.clienteSelecionado()).toEqual(clientesMock[0]);
    expect(component.sugestoesClientes()).toEqual([]);
  });

  it('deve limpar cliente selecionado ao chamar clearCliente', () => {
    component.selectCliente(clientesMock[0]);
    expect(component.clienteSelecionado()).not.toBeNull();

    component.clearCliente();
    expect(component.clienteSelecionado()).toBeNull();
    expect(component.form.controls.clienteId.value).toBe(0);
  });

  it('não deve salvar se o formulário for inválido e deve exibir toast de erro', () => {
    component.salvar();

    expect(component.form.touched).toBe(true);
    expect(toastMock.error).toHaveBeenCalledWith(
      'Formulário incompleto',
      expect.any(String)
    );
    expect(veiculosServiceMock.create).not.toHaveBeenCalled();
  });

  it('deve salvar com sucesso ao preencher todos os campos obrigatórios e navegar para /motos', () => {
    veiculosServiceMock.create.mockReturnValue(of({ id: 101, placa: 'BRA2E19' }));

    // Configura marca e modelo
    component.onMarcaChange({ target: { value: '1' } } as unknown as Event);
    component.form.controls.modeloId.setValue(10);

    // Configura cliente
    component.selectCliente(clientesMock[0]);

    // Configura placa
    component.form.controls.placa.setValue('BRA2E19');
    component.form.controls.cor.setValue('Azul');
    component.form.controls.km.setValue('5000');

    expect(component.form.valid).toBe(true);

    component.salvar();

    expect(veiculosServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clienteId: 5,
        placa: 'BRA2E19',
        modeloId: 10,
        cor: 'Azul',
        km: '5000',
      })
    );
    expect(toastMock.success).toHaveBeenCalledWith(
      'Veículo cadastrado',
      expect.stringContaining('BRA2E19')
    );
    expect(router.navigate).toHaveBeenCalledWith(['/motos']);
  });

  it('deve exibir toast de erro quando a API falhar no cadastro', () => {
    veiculosServiceMock.create.mockReturnValue(
      throwError(() => ({ error: { message: 'Placa já cadastrada no sistema.' } }))
    );

    // Preenche campos válidos
    component.onMarcaChange({ target: { value: '1' } } as unknown as Event);
    component.form.controls.modeloId.setValue(10);
    component.selectCliente(clientesMock[0]);
    component.form.controls.placa.setValue('BRA2E19');

    component.salvar();

    expect(component.submitting()).toBe(false);
    expect(toastMock.error).toHaveBeenCalledWith(
      'Erro ao cadastrar',
      'Placa já cadastrada no sistema.'
    );
  });
});
