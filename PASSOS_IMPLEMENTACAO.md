# 📋 Passos para Completar o Projeto - Oficina MotoPro Web

## FASE 1: FUNDAÇÃO (Sprint 1-2) 🔴 CRÍTICO

### Semana 1: Infraestrutura Base

- [ ] **1.1 Toast/Notification Service**
  ```bash
  ng generate service shared/services/toast
  ng generate component shared/ui/toast
  ```
  - Criar serviço de notificações com signals
  - Componente visual usando PrimeNG Toast
  - Adicionar no MainLayout

- [ ] **1.2 Loading Service**
  ```bash
  ng generate service shared/services/loading
  ng generate component shared/ui/loading-spinner
  ```
  - Loading global com overlay
  - Integrar no HTTP interceptor

- [ ] **1.3 Error Interceptor**
  ```bash
  ng generate interceptor core/interceptors/error
  ```
  - Tratar 401 → redirecionar para login
  - Tratar 403 → toast de erro de permissão
  - Tratar 500 → toast de erro do servidor
  - Integrar com ToastService

- [ ] **1.4 Confirmation Dialog Service**
  ```bash
  ng generate service shared/services/confirmation
  ```
  - Usar PrimeNG ConfirmDialog
  - Adicionar no MainLayout
  - Exemplo de uso: deletar registros

### Semana 2: Componentes Reutilizáveis

- [ ] **2.1 Input Masks**
  ```bash
  npm install ngx-mask
  ```
  - CPF: 000.000.000-00
  - CNPJ: 00.000.000/0000-00
  - Telefone: (00) 00000-0000
  - CEP: 00000-000
  - Placa: AAA-0000 ou AAA0A00

- [ ] **2.2 Validadores Customizados**
  ```bash
  ng generate service shared/validators/document-validator
  ```
  - Validar CPF
  - Validar CNPJ
  - Validar e-mail
  - Validar telefone
  - Validar CEP

- [ ] **2.3 Serviço de Busca de CEP**
  ```bash
  ng generate service shared/services/cep
  ```
  - Integrar com ViaCEP API
  - Preencher automaticamente endereço

- [ ] **2.4 Componente de Tabela Reutilizável**
  ```bash
  ng generate component shared/ui/data-table
  ```
  - Usar PrimeNG Table
  - Props: data, columns, loading, actions
  - Paginação
  - Ordenação
  - Filtro por coluna

---

## FASE 2: CLIENTES (Sprint 3-4) 🟡 ALTA PRIORIDADE

### Semana 3: Cliente - CRUD Completo

- [ ] **3.1 Página de Detalhe do Cliente**
  ```bash
  ng generate component features/clientes/pages/cliente-detalhe
  ```
  - Receber ID pela rota `/clientes/:id`
  - Tabs: Dados Gerais, Endereços, Contatos, Veículos, Histórico
  - Usar PrimeNG TabView
  - Botões: Editar, Excluir, Voltar

- [ ] **3.2 Adicionar Rota de Detalhe**
  ```typescript
  // app.routes.ts
  { path: 'clientes/:id', component: ClienteDetalhe }
  ```

- [ ] **3.3 Links na Lista**
  - Adicionar routerLink nas linhas da tabela de clientes
  - Click na linha → navegar para detalhe

### Semana 4: Cliente - Formulários Avançados

- [ ] **4.1 Melhorar Formulário de Cadastro**
  - Validações com os validators customizados
  - Busca automática de CEP
  - Input masks aplicados
  - Seção de endereços (array de FormGroups)
  - Seção de contatos (array de FormGroups)

- [ ] **4.2 Formulário de Edição**
  ```bash
  ng generate component features/clientes/pages/cliente-editar
  ```
  - Rota: `/clientes/:id/editar`
  - Pre-carregar dados do cliente
  - Salvar alterações
  - Feedback com toast

- [ ] **4.3 Upload de Anexos**
  ```bash
  ng generate component shared/ui/file-upload
  ```
  - Usar PrimeNG FileUpload
  - Enviar para backend
  - Listar anexos do cliente
  - Download e exclusão

---

## FASE 3: ORDENS DE SERVIÇO (Sprint 5-7) 🔴 CRÍTICO

### Semana 5: OS - Lista e Navegação

- [ ] **5.1 Renomear Componente**
  - Renomear `os-detalhe` para `os-lista`
  - Atualizar rota para `/ordens`

- [ ] **5.2 Página de Lista de OS**
  - Usar tabela reutilizável
  - Colunas: Nº, Cliente, Mecânico, Status, Data Abertura, Ações
  - Filtros: Status, Data, Mecânico
  - Botão "Nova OS"

- [ ] **5.3 Criar Rotas Faltantes**
  ```typescript
  { path: 'ordens', component: OsLista },
  { path: 'ordens/nova', component: OsFormulario },
  { path: 'ordens/:id', component: OsDetalhe },
  { path: 'ordens/:id/editar', component: OsFormulario }
  ```

### Semana 6: OS - Formulário de Criação

- [ ] **6.1 Componente de Formulário**
  ```bash
  ng generate component features/ordens-servico/pages/os-formulario
  ```
  - Campos: Cliente, Mecânico, Descrição do Problema, Status
  - AutoComplete para buscar cliente
  - Dropdown para selecionar mecânico
  - Data de abertura (hoje por padrão)

- [ ] **6.2 Seção de Itens (Peças/Serviços)**
  - Array de FormGroups
  - Campos por item: Descrição, Quantidade, Valor Unitário
  - Cálculo automático do Total
  - Botões: Adicionar Item, Remover Item
  - Total Geral da OS

- [ ] **6.3 AutoComplete de Peças**
  ```bash
  ng generate component shared/ui/peca-autocomplete
  ```
  - Buscar peças do estoque
  - Preencher automaticamente valor unitário
  - Verificar disponibilidade em estoque

### Semana 7: OS - Recursos Avançados

- [ ] **7.1 Checklist de Inspeção**
  - Array de checkboxes
  - Itens padrão: Nível de óleo, Freios, Pneus, etc.
  - Campo de observação por item

- [ ] **7.2 Upload de Fotos**
  - Fotos do veículo
  - Fotos dos problemas
  - Galeria de imagens

- [ ] **7.3 Registro de Pagamentos**
  - Form de pagamento dentro da OS
  - Campos: Valor, Método, Data, Observação
  - Lista de pagamentos realizados
  - Cálculo de saldo

- [ ] **7.4 Histórico de Alterações**
  - Carregar do backend
  - Timeline com data, usuário e alterações

- [ ] **7.5 Avaliação do Serviço**
  - PrimeNG Rating
  - Campo de comentário
  - Salvar avaliação

---

## FASE 4: VEÍCULOS (Sprint 8) 🟡 ALTA PRIORIDADE

- [ ] **8.1 Formulário de Cadastro**
  ```bash
  ng generate component features/motos/pages/veiculo-cadastro
  ```
  - Campos: Placa, Marca, Modelo, Ano, Cor, Chassi, Renavam
  - Vincular ao cliente (autocomplete)
  - Rota: `/motos/novo`

- [ ] **8.2 Melhorar Página de Detalhe**
  - Informações do veículo
  - Histórico de OS deste veículo
  - Fotos do veículo
  - Botões: Editar, Nova OS para este veículo

- [ ] **8.3 Adicionar Coluna de Ações na Lista**
  - Botão "Ver Detalhes"
  - Botão "Editar"
  - Botão "Excluir" (com confirmação)

---

## FASE 5: ESTOQUE (Sprint 9) 🟡 MÉDIA PRIORIDADE

- [ ] **9.1 Formulário de Cadastro de Peça**
  ```bash
  ng generate component features/estoque/pages/estoque-cadastro
  ```
  - Campos: Nome, Código, Categoria, Fabricante, Preço, Estoque Mínimo
  - Rota: `/estoque/novo`

- [ ] **9.2 Página de Detalhe da Peça**
  ```bash
  ng generate component features/estoque/pages/estoque-detalhe
  ```
  - Informações da peça
  - Histórico de movimentações
  - Alertas de estoque baixo
  - Rota: `/estoque/:id`

- [ ] **9.3 Movimentação de Estoque**
  ```bash
  ng generate component features/estoque/pages/estoque-movimentacao
  ```
  - Tipo: Entrada ou Saída
  - Quantidade
  - Motivo
  - Atualizar estoque automaticamente

- [ ] **9.4 Alertas de Estoque Baixo**
  - Badge na sidebar mostrando quantidade de alertas
  - Filtro na lista para mostrar apenas peças abaixo do mínimo

---

## FASE 6: FORNECEDORES E MECÂNICOS (Sprint 10) 🟢 MÉDIA PRIORIDADE

### Fornecedores

- [ ] **10.1 Formulário de Cadastro**
  ```bash
  ng generate component features/fornecedores/pages/fornecedor-cadastro
  ```
  - Campos: Nome, CNPJ, Contato, E-mail, Telefone, Endereço
  - Rota: `/fornecedores/novo`

- [ ] **10.2 Melhorar Página de Detalhe**
  - Informações do fornecedor
  - Avaliações
  - Histórico de compras
  - Botão "Nova Compra"

### Mecânicos

- [ ] **10.3 Formulário de Cadastro**
  ```bash
  ng generate component features/mecanicos/pages/mecanico-cadastro
  ```
  - Campos: Nome, CPF, Especialidades, Nível, Status
  - Rota: `/mecanicos/novo`

- [ ] **10.4 Melhorar Página de Detalhe**
  - Informações do mecânico
  - OS concluídas
  - Avaliações
  - Estatísticas de produtividade

---

## FASE 7: FINANCEIRO (Sprint 11) 🟢 MÉDIA/BAIXA PRIORIDADE

- [ ] **11.1 Contas a Pagar - Formulário**
  ```bash
  ng generate component features/financeiro/pages/conta-pagar-formulario
  ```
  - Campos: Fornecedor, Valor, Vencimento, Status, Observações
  - Marcar como paga

- [ ] **11.2 Contas a Receber - Formulário**
  ```bash
  ng generate component features/financeiro/pages/conta-receber-formulario
  ```
  - Vinculado a OS ou avulso
  - Campos: Cliente, Valor, Vencimento, Status
  - Marcar como recebida

- [ ] **11.3 Dashboard Financeiro - Melhorias**
  - Gráficos (instalar Chart.js ou ApexCharts)
  - Filtros por período
  - Exportar relatórios

---

## FASE 8: TESTES (Sprint 12-13) 🟡 ALTA PRIORIDADE

### Semana 12: Testes Unitários

- [ ] **12.1 Testes dos Services**
  - AuthService
  - ClientesService
  - OrdensService
  - EstoqueService
  - Demais services

- [ ] **12.2 Testes dos Validators**
  - CPF
  - CNPJ
  - CEP

- [ ] **12.3 Testes do AuthGuard**

- [ ] **12.4 Testes dos Interceptors**

### Semana 13: Testes de Componentes

- [ ] **13.1 Testes de Componentes Principais**
  - LoginPage
  - ClienteLista
  - ClienteCadastro
  - OsFormulario

- [ ] **13.2 Testes de Componentes Shared**
  - DataTable
  - FileUpload
  - Toast

---

## FASE 9: RESPONSIVIDADE E UX (Sprint 14) 🟢 MÉDIA PRIORIDADE

- [ ] **14.1 Menu Mobile**
  - Hamburger menu
  - Sidebar colapsável

- [ ] **14.2 Tabelas Responsivas**
  - Scroll horizontal em telas pequenas
  - Cards em mobile (alternativa às tabelas)

- [ ] **14.3 Formulários em Mobile**
  - Labels visíveis
  - Inputs com tamanho adequado
  - Botões de fácil clique

- [ ] **14.4 Dashboard em Mobile**
  - KPIs empilhados
  - Gráficos adaptados

---

## FASE 10: FEATURES AVANÇADAS (Sprint 15-16) 🔵 BAIXA PRIORIDADE

### Semana 15: Relatórios

- [ ] **15.1 Relatório de OS**
  ```bash
  ng generate component features/relatorios/pages/relatorio-os
  ```
  - Filtros: Período, Status, Mecânico
  - Exportar PDF
  - Exportar Excel

- [ ] **15.2 Relatório de Faturamento**
  - Receitas por período
  - Despesas
  - Lucro
  - Gráficos

- [ ] **15.3 Relatório de Estoque**
  - Valor total em estoque
  - Peças mais utilizadas
  - Alertas

### Semana 16: Notificações

- [ ] **16.1 Notificações Push (Browser)**
  - Pedir permissão ao usuário
  - Notificar quando OS ficar pronta

- [ ] **16.2 Notificações por E-mail**
  - Backend envia e-mail
  - Confirmar integração

---

## FASE 11: SEGURANÇA E PERFORMANCE (Sprint 17) 🟡 ALTA PRIORIDADE

- [ ] **17.1 Refresh Token**
  - Implementar no AuthService
  - Interceptor para renovar token automaticamente

- [ ] **17.2 Roles e Permissões**
  - Criar RoleGuard
  - Esconder funcionalidades por role
  - Admin, Mecânico, Atendente

- [ ] **17.3 Lazy Loading**
  - Converter rotas para lazy loading
  - Reduzir bundle inicial

- [ ] **17.4 Otimização de Bundle**
  - Analisar bundle size
  - Tree shaking
  - Remover dependências não utilizadas

---

## FASE 12: DOCUMENTAÇÃO E DEPLOY (Sprint 18) 🟢 MÉDIA PRIORIDADE

- [ ] **18.1 README.md Completo**
  - Pré-requisitos
  - Instalação
  - Como rodar
  - Como testar
  - Arquitetura

- [ ] **18.2 Guia de Contribuição**
  - CONTRIBUTING.md
  - Code style
  - Pull request template

- [ ] **18.3 Documentação de API**
  - Endpoints disponíveis
  - Exemplos de request/response

- [ ] **18.4 CI/CD**
  - GitHub Actions
  - Build automático
  - Deploy automático (Vercel, Netlify, Azure)

- [ ] **18.5 Ambientes**
  - Verificar URLs de produção
  - Configurar variáveis de ambiente

---

## 🎯 PRIORIDADES RESUMIDAS

### 🔴 CRÍTICO (Fazer PRIMEIRO)
1. Toast Service
2. Error Interceptor
3. CRUD Completo de Clientes
4. CRUD Completo de OS

### 🟡 ALTA PRIORIDADE
1. CRUD de Veículos
2. CRUD de Estoque
3. Testes Unitários
4. Segurança (Refresh Token, Roles)

### 🟢 MÉDIA PRIORIDADE
1. CRUD de Fornecedores
2. CRUD de Mecânicos
3. Relatórios
4. Responsividade

### 🔵 BAIXA PRIORIDADE
1. Notificações Push
2. PWA
3. i18n
4. E2E Tests

---

## ✅ CHECKLIST RÁPIDO - Primeiros Passos

Use esta lista para começar HOJE:

```bash
# 1. Criar serviços essenciais
ng generate service shared/services/toast
ng generate service shared/services/loading
ng generate service shared/services/confirmation

# 2. Criar componentes UI
ng generate component shared/ui/toast
ng generate component shared/ui/loading-spinner

# 3. Criar interceptor de erros
ng generate interceptor core/interceptors/error

# 4. Instalar dependências
npm install ngx-mask
npm install chart.js  # para gráficos

# 5. Criar componentes faltantes
ng generate component features/clientes/pages/cliente-detalhe
ng generate component features/clientes/pages/cliente-editar
ng generate component features/ordens-servico/pages/os-formulario
```

---

## 📝 Notas Finais

- **Estimativa Total:** 18 sprints (≈ 9-12 meses com 1 dev)
- **MVP Viável:** Após Sprint 7 (OS funcionais)
- **Ponto de Deploy Inicial:** Após Sprint 13 (com testes)

**Boa sorte! 🚀**
