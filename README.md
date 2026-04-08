# 🏍️ Oficina MotoPro Web

<div align="center">

[![Angular](https://img.shields.io/badge/Angular-21.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-21.0.1-0078D7?style=for-the-badge&logo=prime&logoColor=white)](https://primeng.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.14-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Sistema de Gestão para Oficinas de Motos**

[Características](#-características) • [Instalação](#-instalação) • [Uso](#-como-usar) • [Estrutura](#-estrutura-do-projeto) • [Roadmap](#-roadmap) • [Contribuir](#-como-contribuir)

</div>

---

## 📋 Sobre o Projeto

**Oficina MotoPro** é um sistema web completo para gestão de oficinas mecânicas especializadas em motos, desenvolvido com as tecnologias mais modernas do ecossistema Angular.

### 🎯 Objetivo

Fornecer uma solução integrada que facilite o gerenciamento de:
- 👥 Clientes e histórico de atendimentos
- 🏍️ Veículos e fichas técnicas
- 📋 Ordens de serviço (OS)
- 📦 Estoque de peças e produtos
- 👷 Equipe de mecânicos e produtividade
- 🏭 Fornecedores e avaliações
- 💰 Fluxo financeiro (contas a pagar/receber)

---

## ✨ Características

### 🔐 Autenticação e Segurança
- ✅ Login JWT com tokens seguros
- ✅ Guards de rota (proteção de acesso)
- ✅ Interceptor HTTP para injeção automática de token
- ✅ Controle de sessão via localStorage

### 📊 Dashboard Inteligente
- ✅ KPIs em tempo real
- ✅ Visão consolidada de OS por status
- ✅ Alertas de estoque baixo
- ✅ Previsão de fluxo financeiro
- ✅ Avaliação de fornecedores

### 👥 Gestão de Clientes
- ✅ Listagem com filtros avançados
- ✅ Cadastro de Pessoa Física (CPF) e Jurídica (CNPJ)
- 🚧 Múltiplos endereços e contatos
- 🚧 Histórico completo de atendimentos
- 🚧 Upload de documentos

### 🏍️ Gestão de Veículos
- ✅ Listagem de motos cadastradas
- ✅ Detalhes técnicos do veículo
- 🚧 Formulário de cadastro
- 🚧 Histórico de manutenções
- 🚧 Galeria de fotos

### 📋 Ordens de Serviço
- ✅ Listagem de OS com status
- 🚧 Formulário completo de criação/edição
- 🚧 Adição de itens e peças
- 🚧 Checklist de inspeção
- 🚧 Cálculo automático de valores
- 🚧 Registro de pagamentos
- 🚧 Histórico de alterações
- 🚧 Avaliação do serviço

### 📦 Controle de Estoque
- ✅ Listagem de peças
- ✅ Categorias e fabricantes
- 🚧 Cadastro e edição de peças
- 🚧 Movimentações (entrada/saída)
- 🚧 Alertas de reposição

### 👷 Gestão de Mecânicos
- ✅ Listagem da equipe
- ✅ Níveis e especialidades
- 🚧 Cadastro e edição
- 🚧 Produtividade por mecânico
- 🚧 OS concluídas e avaliações

### 🏭 Gestão de Fornecedores
- ✅ Listagem de fornecedores
- ✅ Avaliações e scoring
- 🚧 Cadastro e edição
- 🚧 Histórico de compras

### 💰 Financeiro
- ✅ Dashboard financeiro
- ✅ Contas a pagar/receber
- 🚧 Registro de movimentações
- 🚧 Conciliação bancária
- 🚧 Relatórios de faturamento

**Legenda:**  
✅ Implementado | 🚧 Em desenvolvimento | ❌ Planejado

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Versão | Descrição |
|-----------|---------|-----------|
| [Angular](https://angular.dev/) | 21.0.0 | Framework principal |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.2 | Linguagem de programação |
| [PrimeNG](https://primeng.org/) | 21.0.1 | Biblioteca de componentes UI |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.14 | Framework CSS utility-first |
| [RxJS](https://rxjs.dev/) | 7.8.0 | Programação reativa |

### Ferramentas de Desenvolvimento
| Ferramenta | Versão | Descrição |
|-----------|---------|-----------|
| [Angular CLI](https://angular.dev/tools/cli) | 21.0.3 | Interface de linha de comando |
| [Vitest](https://vitest.dev/) | 4.0.8 | Framework de testes |
| [Prettier](https://prettier.io/) | - | Formatação de código |

### Características Modernas
- ⚡ **Standalone Components** - Arquitetura sem módulos
- 🎯 **Signals** - Reatividade fina e performática
- 🚀 **Vite** - Build rápido e otimizado
- 📱 **Responsive Design** - Layout adaptável

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 20.x ou superior) - [Download](https://nodejs.org/)
- **npm** (versão 10.9.2 ou superior) - Vem com Node.js
- **Angular CLI** (versão 21.x) - Instalação abaixo

### Instalar Angular CLI

```bash
npm install -g @angular/cli@21
```

### Verificar instalação

```bash
node --version  # Deve mostrar v20.x ou superior
npm --version   # Deve mostrar 10.x ou superior
ng version      # Deve mostrar Angular CLI: 21.x
```

---

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/cleversantoro/oficina-motos-web.git
cd oficina-motos-web
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar ambiente

Edite o arquivo `src/environments/environment.ts` com a URL da sua API:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7047', // ⬅️ Altere para sua API
};
```

Para produção, edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.oficina.com', // ⬅️ URL da API em produção
};
```

---

## 💻 Como Usar

### Modo Desenvolvimento

Inicia o servidor de desenvolvimento na porta 4200:

```bash
npm start
# ou
ng serve
```

Acesse: [http://localhost:4200](http://localhost:4200)

### Modo Desenvolvimento com Proxy para API

Se sua API está em outro domínio/porta, use o proxy:

```bash
npm run start:proxy
```

Edite `proxy.conf.json` para configurar o proxy:

```json
{
  "/api": {
    "target": "https://localhost:7047",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  }
}
```

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

### Rodar Testes

```bash
npm test
```

### Watch Mode (Build Contínua)

```bash
npm run watch
```

---

## 📁 Estrutura do Projeto

```
oficina-motos-web/
├── public/                      # Arquivos públicos estáticos
├── src/
│   ├── app/
│   │   ├── core/                # Funcionalidades essenciais
│   │   │   ├── auth/            # Autenticação (services, guards, interceptors)
│   │   │   ├── models/          # TypeScript interfaces e types
│   │   │   └── services/        # Serviços de API
│   │   │
│   │   ├── features/            # Módulos de funcionalidades
│   │   │   ├── auth/            # Login
│   │   │   ├── clientes/        # Gestão de clientes
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── estoque/         # Controle de estoque
│   │   │   ├── financeiro/      # Gestão financeira
│   │   │   ├── fornecedores/    # Gestão de fornecedores
│   │   │   ├── mecanicos/       # Gestão de mecânicos
│   │   │   ├── motos/           # Gestão de veículos
│   │   │   └── ordens-servico/  # Ordens de serviço
│   │   │
│   │   ├── layout/              # Componentes de layout
│   │   │   ├── header/          # Cabeçalho
│   │   │   ├── sidebar/         # Menu lateral
│   │   │   ├── footer/          # Rodapé
│   │   │   └── main-layout/     # Layout principal
│   │   │
│   │   ├── shared/              # Componentes compartilhados
│   │   │   └── ui/              # Componentes UI reutilizáveis
│   │   │
│   │   ├── app.config.ts        # Configuração da aplicação
│   │   ├── app.routes.ts        # Definição de rotas
│   │   └── app.ts               # Componente raiz
│   │
│   ├── environments/            # Configurações de ambiente
│   ├── index.html               # HTML principal
│   ├── main.ts                  # Entry point
│   └── styles.scss              # Estilos globais
│
├── angular.json                 # Configuração do Angular
├── package.json                 # Dependências e scripts
├── tailwind.config.js           # Configuração do Tailwind
├── tsconfig.json                # Configuração do TypeScript
└── README.md                    # Este arquivo
```

### Convenções de Código

- **Standalone Components** - Todos os componentes são standalone
- **Signals** - Uso preferencial de signals para reatividade
- **TypeScript Strict** - Modo strict habilitado
- **Prettier** - Formatação automática de código
- **Feature-based Structure** - Organização por funcionalidades

---

## 🗺️ Roadmap

### ✅ Fase 1 - Base (Concluída)
- [x] Configuração do projeto Angular 21
- [x] Integração PrimeNG + Tailwind
- [x] Autenticação JWT
- [x] Layout principal
- [x] Navegação e rotas
- [x] Serviços de API

### 🚧 Fase 2 - Features Essenciais (Em andamento)
- [ ] Toast/Notification service
- [ ] Error interceptor global
- [ ] CRUD completo de Clientes
- [ ] CRUD completo de Ordens de Serviço
- [ ] Formulários com validações
- [ ] Upload de arquivos

### 📅 Fase 3 - CRUD Completo (Planejada)
- [ ] CRUD de Veículos
- [ ] CRUD de Estoque
- [ ] CRUD de Fornecedores
- [ ] CRUD de Mecânicos
- [ ] Gestão financeira completa

### 📅 Fase 4 - Features Avançadas (Planejada)
- [ ] Relatórios em PDF/Excel
- [ ] Gráficos interativos
- [ ] Notificações push
- [ ] Dashboard em tempo real
- [ ] Impressão de OS

### 📅 Fase 5 - Qualidade (Planejada)
- [ ] Testes unitários (>70% cobertura)
- [ ] Testes E2E
- [ ] Responsividade mobile
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)

> 📊 **Status Atual:** 50% completo  
> 📖 Veja o [PASSOS_IMPLEMENTACAO.md](./PASSOS_IMPLEMENTACAO.md) para o roadmap detalhado

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Siga os passos:

### 1. Fork o projeto

### 2. Crie uma branch para sua feature

```bash
git checkout -b feature/MinhaNovaFeature
```

### 3. Commit suas mudanças

```bash
git commit -m 'Adiciona MinhaNovaFeature'
```

### 4. Push para a branch

```bash
git push origin feature/MinhaNovaFeature
```

### 5. Abra um Pull Request

### Diretrizes

- ✅ Siga as convenções de código do projeto
- ✅ Adicione testes para novas funcionalidades
- ✅ Atualize a documentação quando necessário
- ✅ Use commits semânticos (feat, fix, docs, etc.)

---

## 🧪 Testes

### Executar Testes Unitários

```bash
npm test
```

### Cobertura de Código

```bash
npm run test:coverage
```

### Testes E2E (Quando implementados)

```bash
npm run e2e
```

**Status Atual:** ⚠️ Cobertura de testes baixa (5%). Contribuições são bem-vindas!

---

## 📚 Documentação Adicional

- 📄 [ANALISE_PROJETO.md](./ANALISE_PROJETO.md) - Análise técnica detalhada
- 📋 [PASSOS_IMPLEMENTACAO.md](./PASSOS_IMPLEMENTACAO.md) - Roadmap de implementação
- 📊 [RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md) - Visão executiva do projeto

---

## 🐛 Problemas Conhecidos

- ⚠️ Testes unitários incompletos
- ⚠️ Responsividade mobile não testada
- ⚠️ Formulários de edição faltando em alguns módulos

Veja os [Issues](https://github.com/cleversantoro/oficina-motos-web/issues) para reportar bugs ou sugerir melhorias.

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Clever Santoro**

- GitHub: [@cleversantoro](https://github.com/cleversantoro)
- LinkedIn: [Clever Santoro](https://www.linkedin.com/in/cleversantoro)

---

## 🙏 Agradecimentos

- [Angular Team](https://angular.dev/) - Framework incrível
- [PrimeNG](https://primeng.org/) - Componentes UI de alta qualidade
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- Comunidade open source

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

Feito com ❤️ e ☕ por [Clever Santoro](https://github.com/cleversantoro)

</div>
