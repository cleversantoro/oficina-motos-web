import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginPage } from './login';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let router: Router;
  let authMock: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authMock = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      login: vi.fn().mockReturnValue(of({ token: 'jwt' })),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('não deve submeter quando o formulário for inválido', () => {
    component.submit();
    expect(authMock.login).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('deve autenticar e navegar para /dashboard quando formulário válido', () => {
    component.form.setValue({ email: 'admin@oficina.com', password: 'Password@123' });
    component.submit();

    expect(authMock.login).toHaveBeenCalledWith({
      email: 'admin@oficina.com',
      password: 'Password@123',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.loading()).toBe(false);
  });

  it('deve exibir mensagem de erro quando login falhar', () => {
    authMock.login.mockReturnValueOnce(
      throwError(() => ({ error: { message: 'Credenciais inválidas' } })),
    );

    component.form.setValue({ email: 'admin@oficina.com', password: 'errada' });
    component.submit();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('Credenciais inválidas');
  });
});
