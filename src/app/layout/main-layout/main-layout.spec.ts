import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/auth/auth.service';
import { Toast } from '../../shared/services/toast';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  let fixture: ComponentFixture<MainLayout>;
  let component: MainLayout;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(null).asReadonly(),
            currentRole: signal('Administrador').asReadonly(),
            permissions: signal(['ordens:criar']).asReadonly(),
            logout: vi.fn(),
          },
        },
        { provide: Toast, useValue: { messages: signal([]).asReadonly(), warn: vi.fn(), info: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve alternar e fechar o menu drawer mobile', () => {
    expect(component.menuOpen()).toBe(false);
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);
    component.closeMenu();
    expect(component.menuOpen()).toBe(false);
  });

  it('deve fechar o drawer ao pressionar Escape', () => {
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.menuOpen()).toBe(false);
  });

  it('deve renderizar cabeçalho, navbar lateral e rodapé fixo', () => {
    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-sidebar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-footer')).not.toBeNull();
  });
});
