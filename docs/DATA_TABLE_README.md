# Componente Data Table - Guia de Uso

Sistema de tabela reutilizável com PrimeNG Table, incluindo paginação, ordenação, filtros e ações customizáveis.

## 📦 Arquivos

- **[data-table.ts](data-table.ts)** - Componente principal
- **[data-table.models.ts](data-table.models.ts)** - Modelos e interfaces
- **[data-table.html](data-table.html)** - Template
- **[data-table.scss](data-table.scss)** - Estilos
- **[index.ts](index.ts)** - Barrel export

## 🚀 Importação

```typescript
import { DataTable, TableColumn, TableAction } from '@app/shared/ui/data-table';
```

## 💡 Exemplo Básico

```typescript
import { Component, inject } from '@angular/core';
import { DataTable, TableColumn, TableAction } from '@app/shared/ui/data-table';
import { Toast } from '@app/shared/services/toast';
import { Confirmation } from '@app/shared/services/confirmation';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  dataCadastro: Date;
}

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [DataTable],
  template: `
    <div class="card">
      <h2>Clientes</h2>
      
      <app-data-table
        [data]="clientes"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading"
        (rowSelect)="onClienteSelect($event)"
      />
    </div>
  `
})
export class ClientesListaComponent {
  private toast = inject(Toast);
  private confirmation = inject(Confirmation);

  loading = false;
  clientes: Cliente[] = [];

  // Definição das colunas
  columns: TableColumn<Cliente>[] = [
    {
      field: 'id',
      header: 'ID',
      dataType: 'number',
      width: '80px',
      sortable: true,
      filterable: true,
      filterType: 'numeric'
    },
    {
      field: 'nome',
      header: 'Nome',
      sortable: true,
      filterable: true
    },
    {
      field: 'email',
      header: 'E-mail',
      sortable: true,
      filterable: true
    },
    {
      field: 'telefone',
      header: 'Telefone'
    },
    {
      field: 'ativo',
      header: 'Status',
      dataType: 'boolean',
      align: 'center',
      formatter: (value) => value ? 'Ativo' : 'Inativo'
    },
    {
      field: 'dataCadastro',
      header: 'Data Cadastro',
      dataType: 'date',
      sortable: true
    }
  ];

  // Ações por linha
  actions: TableAction<Cliente>[] = [
    {
      icon: 'pi pi-eye',
      tooltip: 'Visualizar',
      styleClass: 'p-button-rounded p-button-text p-button-info',
      onClick: (cliente) => this.visualizar(cliente)
    },
    {
      icon: 'pi pi-pencil',
      tooltip: 'Editar',
      styleClass: 'p-button-rounded p-button-text p-button-warning',
      onClick: (cliente) => this.editar(cliente)
    },
    {
      icon: 'pi pi-trash',
      tooltip: 'Excluir',
      styleClass: 'p-button-rounded p-button-text p-button-danger',
      onClick: (cliente) => this.excluir(cliente),
      disabled: (cliente) => !cliente.ativo // Desabilita se inativo
    }
  ];

  visualizar(cliente: Cliente): void {
    this.toast.info('Visualizar', `Cliente: ${cliente.nome}`);
  }

  editar(cliente: Cliente): void {
    this.toast.info('Editar', `Editando: ${cliente.nome}`);
  }

  async excluir(cliente: Cliente): Promise<void> {
    const confirmado = await this.confirmation.confirmDelete(cliente.nome);
    
    if (confirmado) {
      // Lógica de exclusão
      this.clientes = this.clientes.filter(c => c.id !== cliente.id);
      this.toast.success('Sucesso', 'Cliente excluído');
    }
  }

  onClienteSelect(cliente: Cliente): void {
    console.log('Selecionado:', cliente);
  }
}
```

## 📋 Definição de Colunas

### Propriedades da Coluna

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `field` | `keyof T \| string` | Campo do objeto |
| `header` | `string` | Título da coluna |
| `dataType` | `'text' \| 'number' \| 'date' \| 'boolean' \| 'currency'` | Tipo para formatação |
| `width` | `string` | Largura (ex: '100px', '20%') |
| `sortable` | `boolean` | Se é ordenável (padrão: false) |
| `filterable` | `boolean` | Se é filtrável |
| `filterType` | `'text' \| 'numeric'` | Tipo de filtro |
| `align` | `'left' \| 'center' \| 'right'` | Alinhamento |
| `formatter` | `(value, row) => string` | Função customizada de formatação |
| `hidden` | `boolean` | Se deve ocultar |
| `styleClass` | `string` | Classe CSS da coluna |

### Exemplo de Colunas

```typescript
columns: TableColumn<Produto>[] = [
  // Coluna simples
  { field: 'nome', header: 'Produto' },
  
  // Com ordenação e filtro
  { 
    field: 'categoria', 
    header: 'Categoria',
    sortable: true,
    filterable: true
  },
  
  // Moeda com alinhamento
  {
    field: 'preco',
    header: 'Preço',
    dataType: 'currency',
    align: 'right',
    sortable: true
  },
  
  // Com formatação customizada
  {
    field: 'estoque',
    header: 'Estoque',
    formatter: (value) => value > 0 ? `${value} un.` : 'Esgotado'
  },
  
  // Data formatada
  {
    field: 'dataCriacao',
    header: 'Criado em',
    dataType: 'date',
    sortable: true
  }
];
```

## 🎯 Actions (Ações)

### Propriedades da Ação

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `icon` | `string` | Ícone PrimeIcons |
| `label` | `string` | Texto do botão (opcional) |
| `tooltip` | `string` | Tooltip ao passar mouse |
| `styleClass` | `string` | Classes CSS do botão |
| `onClick` | `(row: T) => void` | Callback ao clicar |
| `visible` | `(row: T) => boolean` | Condição para exibir |
| `disabled` | `(row: T) => boolean` | Condição para desabilitar |

### Exemplo de Actions

```typescript
actions: TableAction<OrdemServico>[] = [
  // Ação simples
  {
    icon: 'pi pi-eye',
    tooltip: 'Visualizar',
    onClick: (os) => this.visualizar(os)
  },
  
  // Com condicional de visibilidade
  {
    icon: 'pi pi-check',
    tooltip: 'Concluir',
    styleClass: 'p-button-success',
    onClick: (os) => this.concluir(os),
    visible: (os) => os.status === 'Em Andamento',
    disabled: (os) => !os.mecanico
  },
  
  // Ação de exclusão
  {
    icon: 'pi pi-trash',
    tooltip: 'Excluir',
    styleClass: 'p-button-danger p-button-rounded p-button-text',
    onClick: (os) => this.excluir(os),
    visible: (os) => os.status === 'Rascunho'
  }
];
```

## ⚙️ Configurações

### TableConfig

```typescript
config = {
  responsive: true,              // Responsivo
  selectable: true,              // Permite seleção
  selectionMode: 'single',       // 'single' ou 'multiple'
  showGridlines: true,           // Mostrar linhas
  hoverable: true,               // Efeito hover
  size: 'normal',                // 'small', 'normal', 'large'
  globalFilter: true,            // Filtro global
  globalFilterPlaceholder: 'Buscar...',
  exportable: true,              // Botão exportar CSV
  emptyMessage: 'Nenhum registro encontrado'
};
```

### TablePaginationConfig

```typescript
paginationConfig = {
  rows: 10,                      // Linhas por página
  rowsPerPageOptions: [5, 10, 25, 50],
  showPaginator: true,
  paginatorPosition: 'bottom'    // 'top', 'bottom', 'both'
};
```

## 🔧 Eventos

```typescript
<app-data-table
  [data]="items"
  [columns]="columns"
  (rowSelect)="onRowSelect($event)"
  (rowUnselect)="onRowUnselect($event)"
  (rowsSelect)="onRowsSelect($event)"
  (pageChange)="onPageChange($event)"
  (sortChange)="onSortChange($event)"
/>
```

### Handlers de Eventos

```typescript
onRowSelect(item: Cliente): void {
  console.log('Selecionado:', item);
}

onPageChange(event: TablePageEvent): void {
  console.log('Página:', event.page);
  console.log('First:', event.first);
  console.log('Rows:', event.rows);
}

onSortChange(event: TableSortEvent): void {
  console.log('Campo:', event.field);
  console.log('Ordem:', event.order); // 1 ou -1
}
```

## 📊 Seleção de Linhas

### Seleção Única

```typescript
@Component({
  template: `
    <app-data-table
      [data]="items"
      [columns]="columns"
      [config]="{ selectable: true, selectionMode: 'single' }"
      (rowSelect)="onSelect($event)"
    />
  `
})
export class MyComponent {
  onSelect(item: any): void {
    console.log('Item selecionado:', item);
  }
}
```

### Seleção Múltipla

```typescript
@Component({
  template: `
    <app-data-table
      [data]="items"
      [columns]="columns"
      [config]="{ selectable: true, selectionMode: 'multiple' }"
      (rowsSelect)="onSelectMultiple($event)"
    />
    
    @if (selectedItems.length > 0) {
      <p>{{ selectedItems.length }} item(ns) selecionado(s)</p>
      <button (click)="processarSelecionados()">Processar</button>
    }
  `
})
export class MyComponent {
  selectedItems: any[] = [];

  onSelectMultiple(items: any[]): void {
    this.selectedItems = items;
  }

  processarSelecionados(): void {
    console.log('Processar:', this.selectedItems);
  }
}
```

## 🎨 Formatação de Dados

### Tipos Automáticos

```typescript
// Data - automaticamente formatada como dd/MM/yyyy
{ field: 'data', header: 'Data', dataType: 'date' }

// Moeda - automaticamente formatada como R$ 1.234,56
{ field: 'valor', header: 'Valor', dataType: 'currency' }

// Boolean - automaticamente "Sim" ou "Não"
{ field: 'ativo', header: 'Ativo', dataType: 'boolean' }

// Número - formatado com separador de milhar
{ field: 'quantidade', header: 'Qtd', dataType: 'number' }
```

### Formatação Customizada

```typescript
{
  field: 'status',
  header: 'Status',
  formatter: (value, row) => {
    switch (value) {
      case 1: return 'Pendente';
      case 2: return 'Em Andamento';
      case 3: return 'Concluída';
      default: return 'Desconhecido';
    }
  }
}
```

## 📱 Responsividade

A tabela é automaticamente responsiva. Em telas pequenas, as colunas se transformam em cards.

```typescript
config = {
  responsive: true // Ativa modo responsivo
};
```

## 📤 Exportação

```typescript
// Habilitar botão de exportação
config = {
  exportable: true
};

// O usuário pode clicar no botão "Exportar CSV" para baixar os dados
```

## 🔍 Filtros

### Filtro Global

```typescript
config = {
  globalFilter: true,
  globalFilterPlaceholder: 'Buscar em todas as colunas...'
};
```

### Filtro por Coluna

```typescript
columns = [
  {
    field: 'nome',
    header: 'Nome',
    filterable: true,
    filterType: 'text' // Filtro de texto
  },
  {
    field: 'idade',
    header: 'Idade',
    filterable: true,
    filterType: 'numeric' // Filtro numérico
  }
];
```

## 📖 Mais Exemplos

### Com Loading

```typescript
export class ListaComponent {
  loading = false;
  items: any[] = [];

  ngOnInit() {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    
    this.service.buscar().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
```

### Com Paginação Server-Side

```typescript
export class ListaComponent {
  items: any[] = [];
  totalRecords = 0;

  onPageChange(event: TablePageEvent): void {
    const page = event.page + 1;
    const  size = event.rows;
    
    this.service.buscarPaginado(page, size).subscribe(response => {
      this.items = response.items;
      this.totalRecords = response.total;
    });
  }
}
```

## 🎯 Dicas

1. **Performance**: Para grandes volumes de dados, use paginação server-side
2. **Filtros**: Combine filtro global com filtros por coluna para melhor UX
3. **Actions**: Use `visible` e `disabled` para controlar disponibilidade de ações
4. **Seleção**: Para processar múltiplos itens, use `selectionMode: 'multiple'`
5. **Responsivo**: Teste em diferentes tamanhos de tela
6. **Exportação**: Útil para relatórios simples

## 🔗 Componentes Relacionados

- [Toast](../../services/toast.ts) - Notificações
- [Confirmation](../../services/confirmation.ts) - Diálogos de confirmação
- [Loading](../../services/loading.ts) - Indicador de carregamento
