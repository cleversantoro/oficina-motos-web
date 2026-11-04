import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MecanicoListaComponent } from './mecanico-lista';
import { MecanicosService } from '../../../../core/services/mecanicos.service';
import { AuthService } from '../../../../core/auth/auth.service';

describe('MecanicoListaComponent', () => {
  let fixture: ComponentFixture<MecanicoListaComponent>;
  let component: MecanicoListaComponent;
  let router: Router;

  const mockMecanicos = [
    {
      id: 7,
      codigo: 'MEC-007',
      nome: 'Roberto',
      sobrenome: 'Almeida',
      nivel: 'Senior',
      status: 'ATIVO',
      documentoPrincipal: '12345678909',
      valorHora: 90,
    },
    {
      id: 8,
      codigo: 'MEC-008',
      nome: 'Fernanda',
      sobrenome: 'Costa',
      nivel: 'Pleno',
      status: 'ATIVO',
      documentoPrincipal: '98765432100',
      valorHora: 75,
    },
  ];

  const mecanicosServiceMock = {
    list: vi.fn().mockReturnValue(of(mockMecanicos)),
    get: vi.fn().mockReturnValue(of(mockMecanicos[0])),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };

  const authServiceMock = {
    currentRole: vi.fn().mockReturnValue('Admin'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mecanicosServiceMock.list.mockReturnValue(of(mockMecanicos));

    await TestBed.configureTestingModule({
      imports: [MecanicoListaComponent],
      providers: [
        { provide: MecanicosService, useValue: mecanicosServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([]),
      ],
    })
      .overrideComponent(MecanicoListaComponent, {
        set: {
          providers: [{ provide: MecanicosService, useValue: mecanicosServiceMock }],
        },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(MecanicoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar a lista de mecânicos e renderizar links para /mecanicos/:id (T-016.2)', () => {
    expect(component).toBeTruthy();
    expect(component.mecanicos.length).toBe(2);

    const nameLinks = fixture.nativeElement.querySelectorAll('a.name-link');
    expect(nameLinks.length).toBe(2);
    expect(nameLinks[0].textContent.trim()).toBe('Roberto Almeida');
    expect(nameLinks[0].getAttribute('href')).toBe('/mecanicos/7');
    expect(nameLinks[1].getAttribute('href')).toBe('/mecanicos/8');
  });

  it('deve navegar para /mecanicos/:id ao acionar openDetails()', () => {
    component.openDetails(mockMecanicos[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/mecanicos', 7]);
  });

  it('deve renderizar o botão de visualizar com link para /mecanicos/:id', () => {
    const viewButtons = fixture.nativeElement.querySelectorAll('a.view-btn');
    expect(viewButtons.length).toBe(2);
    expect(viewButtons[0].getAttribute('href')).toBe('/mecanicos/7');
  });
});

