import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { VeiculosService } from '../../../../core/services/veiculos.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { VeiculoLista } from './veiculo-lista';

describe('VeiculoLista', () => {
  let fixture: ComponentFixture<VeiculoLista>;
  let svcMock: {
    list: ReturnType<typeof vi.fn>;
    marcas: ReturnType<typeof vi.fn>;
    modelos: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    svcMock = {
      list: vi.fn().mockReturnValue(
        of([
          {
            id: 1,
            placa: 'ABC1D23',
            principal: true,
            modeloId: 10,
            anoFab: 2023,
            anoMod: 2024,
            cor: 'Preto',
            combustivel: 'Gasolina',
            km: 12000,
            ativo: true,
          },
        ]),
      ),
      marcas: vi.fn().mockReturnValue(of([{ id: 5, nome: 'Honda' }])),
      modelos: vi.fn().mockReturnValue(of([{ id: 10, nome: 'CB 500F', marcaId: 5 }])),
      delete: vi.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [VeiculoLista],
      providers: [
        provideRouter([]),
        { provide: VeiculosService, useValue: svcMock },
        { provide: AuthService, useValue: { currentRole: () => 'ADMIN' } },
        { provide: Toast, useValue: { success: vi.fn(), error: vi.fn() } },
        { provide: Confirmation, useValue: { confirmDelete: vi.fn().mockResolvedValue(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VeiculoLista);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('deve renderizar os veículos usando app-datatable', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('ABC1D23');
    expect(text).toContain('Honda');
    expect(text).toContain('CB 500F');
    expect(text).toContain('Ativo');
    expect(fixture.nativeElement.querySelector('app-datatable')).not.toBeNull();
  });
});
