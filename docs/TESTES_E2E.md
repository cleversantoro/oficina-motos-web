# Testes E2E da Ordem de Serviço

A US-009 prevê testes E2E para acesso autorizado, acesso negado, seleção de cliente/veículo e criação de ordem.

No estado atual do projeto não há runner E2E configurado no `package.json` nem diretório `e2e/`. Por isso, a cobertura E2E permanece pendente até a adoção de um runner, como Playwright ou Cypress.

A validação disponível nesta etapa é:

- `npm run build` para compilação e rotas lazy;
- testes unitários do componente e dos services quando a suíte global puder compilar;
- quickstart manual com API e dados de teste.

O bloqueio atual da suíte global é registrado separadamente: `error-interceptor.spec.ts` possui erros legados de `spyOn` e uso de `HttpInterceptorFn`.
