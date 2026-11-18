import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Confirmation } from '../../../../shared/services/confirmation';
import { Toast } from '../../../../shared/services/toast';
import { ClienteLista } from './cliente-lista';

@Component({
  standalone: true,
  imports: [ClienteLista],
  template: '<app-cliente-lista />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OnPushHostComponent {}

describe('ClienteLista', () => {
  let fixture: ComponentFixture<OnPushHostComponent>;
  let clientesServiceMock: {
    listTable: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    clientesServiceMock = {
      listTable: vi.fn().mockReturnValue(
        of([
          {
            id: 1,
            nome: 'João Silva',
            documento: '123.456.789-00',
            email: 'joao@example.com',
            telefone: '11999999999',
            tipoDescricao: 'Pessoa Física',
            status: 1,
            statusDescricao: 'Ativo',
            vip: true,
          },
        ]),
      ),
      delete: vi.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [OnPushHostComponent],
      providers: [
        provideRouter([]),
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: AuthService, useValue: { currentRole: () => 'ADMIN' } },
        { provide: Toast, useValue: { success: vi.fn(), error: vi.fn() } },
        { provide: Confirmation, useValue: { confirmDelete: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OnPushHostComponent);
  });

  it('deve carregar e exibir os clientes na primeira renderizacao mesmo dentro de host OnPush', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(clientesServiceMock.listTable).toHaveBeenCalledTimes(1);
    expect(text).toContain('João Silva');
    expect(text).toContain('1 registros');
  });
});
