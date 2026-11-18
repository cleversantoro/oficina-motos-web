import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatatableComponent } from './datatable';
import { DatatableAction, DatatableColumn } from './datatable.models';

interface MockRow extends Record<string, unknown> {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  status: string;
  salario: number;
}

describe('DatatableComponent', () => {
  let fixture: ComponentFixture<DatatableComponent<MockRow>>;
  let component: DatatableComponent<MockRow>;

  const columns: DatatableColumn<MockRow>[] = [
    { field: 'id', header: 'ID' },
    { field: 'nome', header: 'Colaborador', subField: 'email' },
    { field: 'cargo', header: 'Cargo' },
    { field: 'status', header: 'Status', dataType: 'badge' },
    { field: 'salario', header: 'Salário', dataType: 'currency', align: 'right' },
  ];

  const rows: MockRow[] = [
    { id: 1001, nome: 'Ana Beatriz', email: 'ana@empresa.com', cargo: 'Tech Lead', status: 'Ativo', salario: 14500 },
    { id: 1002, nome: 'Carlos Mendes', email: 'carlos@empresa.com', cargo: 'Dev Full Stack', status: 'Ativo', salario: 9800 },
    { id: 1003, nome: 'Mariana Santos', email: 'mariana@empresa.com', cargo: 'UX Designer', status: 'Ativo', salario: 8200 },
    { id: 1004, nome: 'Rafael Ferreira', email: 'rafael@empresa.com', cargo: 'Analista', status: 'Pendente', salario: 7400 },
    { id: 1005, nome: 'Juliana Rocha', email: 'juliana@empresa.com', cargo: 'Gerente', status: 'Ativo', salario: 11200 },
    { id: 1006, nome: 'Pedro Souza', email: 'pedro@empresa.com', cargo: 'QA', status: 'Inativo', salario: 6500 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatatableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatatableComponent<MockRow>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', rows);
    fixture.componentRef.setInput('statusField', 'status');
    fixture.componentRef.setInput('statusOptions', [
      { label: 'Ativo', value: 'Ativo' },
      { label: 'Pendente', value: 'Pendente' },
      { label: 'Inativo', value: 'Inativo' },
    ]);
    fixture.detectChanges();
  });

  it('deve paginar os dados exibindo 5 itens na primeira página e 1 na segunda', () => {
    expect(component.paginatedData().length).toBe(5);
    expect(component.totalPages()).toBe(2);

    component.goToPage(2);
    fixture.detectChanges();

    expect(component.paginatedData().map((r) => r.id)).toEqual([1006]);
  });

  it('deve filtrar por busca textual e por status e resetar para página 1', () => {
    component.goToPage(2);
    component.onSearchChange('rafael');
    fixture.detectChanges();

    expect(component.effectivePage()).toBe(1);
    expect(component.processedData().map((r) => r.id)).toEqual([1004]);

    component.clearSearch();
    component.onStatusFilterChange('Inativo');
    fixture.detectChanges();

    expect(component.processedData().map((r) => r.id)).toEqual([1006]);

    component.resetFilters();
    expect(component.processedData().length).toBe(6);
  });

  it('deve ordenar colunas em ordem crescente e decrescente', () => {
    const salarioCol = columns[4];
    component.handleSort(salarioCol);
    expect(component.processedData()[0].id).toBe(1006);

    component.handleSort(salarioCol);
    expect(component.processedData()[0].id).toBe(1001);
  });

  it('deve controlar seleção individual, selecionar todos da página, estado indeterminado e exclusão em lote', () => {
    const bulkSpy = vi.fn();
    component.bulkDelete.subscribe(bulkSpy);

    component.toggleRowSelection(rows[0]);
    expect(component.selectedCount()).toBe(1);
    expect(component.somePageSelected()).toBe(true);
    expect(component.allPageSelected()).toBe(false);

    component.toggleSelectAllOnPage(true);
    expect(component.selectedCount()).toBe(5);
    expect(component.allPageSelected()).toBe(true);
    expect(component.somePageSelected()).toBe(false);

    component.triggerBulkDelete();
    expect(bulkSpy).toHaveBeenCalledTimes(1);
    expect(bulkSpy.mock.calls[0][0]).toHaveLength(5);
  });

  it('deve executar ações por linha e exibir estado vazio quando não houver resultados', () => {
    const viewSpy = vi.fn();
    const actions: DatatableAction<MockRow>[] = [
      { id: 'view', icon: 'fa-solid fa-eye', label: 'Visualizar', variant: 'view', onClick: viewSpy },
    ];
    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const viewBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.dt-action-btn');
    viewBtn?.click();
    expect(viewSpy).toHaveBeenCalledWith(rows[0]);

    component.onSearchChange('inexistente-xyz');
    fixture.detectChanges();
    const emptyEl = fixture.nativeElement.querySelector('.dt-empty-state');
    expect(emptyEl).not.toBeNull();
  });
});
