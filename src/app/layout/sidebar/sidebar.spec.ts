import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppSidebar } from './sidebar';

describe('AppSidebar', () => {
  let fixture: ComponentFixture<AppSidebar>;
  let component: AppSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve renderizar os itens principais de navegação incluindo Segurança', () => {
    const links = fixture.nativeElement.querySelectorAll('a.nav-link');
    expect(links.length).toBe(component.navItems.length);
    expect(fixture.nativeElement.textContent).toContain('Dashboard');
    expect(fixture.nativeElement.textContent).toContain('Fornecedores');
    expect(fixture.nativeElement.textContent).toContain('Seguranca');
  });

  it('deve emitir navigate ao clicar em um item de menu', () => {
    const spy = vi.spyOn(component.navigate, 'emit');
    const firstLink = fixture.nativeElement.querySelector('a.nav-link') as HTMLAnchorElement;
    firstLink.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
