import { Router } from '@angular/router';
import { OsListaComponent } from './os-lista';

describe('OsListaComponent', () => {
  function createComponent(permissions: string[] = ['ordens:visualizar', 'ordens:criar']) {
    const router = { navigate: () => Promise.resolve(true) } as unknown as Router;
    const auth = {
      permissions: () => permissions,
      currentRole: () => 'Consulta',
    } as any;
    const toast = { warn: () => undefined, error: () => undefined } as any;
    return new OsListaComponent({} as any, auth, router, toast);
  }

  it('permite a ação de criação quando a sessão possui a permissão', () => {
    expect(createComponent().canCreateOrdem()).toBe(true);
  });

  it('oculta a ação de criação quando a permissão está ausente', () => {
    expect(createComponent(['ordens:visualizar']).canCreateOrdem()).toBe(false);
  });

  it('ignora identificador inválido ao abrir detalhes', () => {
    const component = createComponent();
    expect(() => component.openDetails({ id: 0 } as any)).not.toThrow();
  });
});
