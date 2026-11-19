import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let component: ConfirmModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
  });

  it('não deve renderizar o modal quando isOpen for false', () => {
    component.isOpen = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.backdrop')).toBeNull();
  });

  it('deve renderizar a mensagem e emitir confirm ao clicar em Excluir', () => {
    const confirmSpy = vi.fn();
    component.isOpen = true;
    component.message = 'Deseja realmente apagar este registro?';
    component.confirm.subscribe(confirmSpy);
    fixture.detectChanges();

    const modalBox = fixture.nativeElement.querySelector('.modal-box') as HTMLElement;
    expect(modalBox).not.toBeNull();
    expect(modalBox.textContent).toContain('Confirmar Exclusão');
    expect(modalBox.textContent).toContain('Deseja realmente apagar este registro?');

    const deleteBtn = fixture.nativeElement.querySelector('.btn-delete') as HTMLButtonElement;
    deleteBtn.click();
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it('deve emitir cancel ao clicar em Cancelar ou no backdrop', () => {
    const cancelSpy = vi.fn();
    component.isOpen = true;
    component.cancel.subscribe(cancelSpy);
    fixture.detectChanges();

    const cancelBtn = fixture.nativeElement.querySelector('.btn-cancel') as HTMLButtonElement;
    cancelBtn.click();
    expect(cancelSpy).toHaveBeenCalledTimes(1);

    const backdrop = fixture.nativeElement.querySelector('.backdrop') as HTMLElement;
    backdrop.click();
    expect(cancelSpy).toHaveBeenCalledTimes(2);
  });
});
