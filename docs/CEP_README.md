# Serviço de Busca de CEP

Serviço para busca automática de endereços usando a API ViaCEP.

## 📦 Arquivos

- **[cep.ts](cep.ts)** - Serviço principal com integração ViaCEP
- **[cep.examples.ts](cep.examples.ts)** - Exemplos completos de uso
- **[../models/endereco.ts](../models/endereco.ts)** - Modelos de dados

## 🌐 API ViaCEP

API pública e gratuita para consulta de CEPs brasileiros.
- URL: https://viacep.com.br/
- Formato: JSON
- Sem necessidade de autenticação
- Timeout: 10 segundos
- Retry: 2 tentativas automáticas

## 🚀 Como Usar

### 1. Injetar o Serviço

```typescript
import { Component, inject } from '@angular/core';
import { CepService } from '@app/shared/services/cep';

@Component({
  // ...
})
export class MeuComponente {
  private cepService = inject(CepService);
}
```

### 2. Buscar CEP (Observable)

```typescript
buscarCep(): void {
  const cep = '01310-100'; // Com ou sem máscara

  this.cepService.buscarCep(cep).subscribe({
    next: (endereco) => {
      console.log(endereco);
      // {
      //   cep: '01310100',
      //   logradouro: 'Avenida Paulista',
      //   bairro: 'Bela Vista',
      //   cidade: 'São Paulo',
      //   estado: 'São Paulo',
      //   uf: 'SP',
      //   ...
      // }
    },
    error: (error) => {
      console.error(error.message);
      // 'CEP não encontrado' ou 'CEP inválido'
    }
  });
}
```

### 3. Buscar CEP (Async/Await)

```typescript
async buscarCepAsync(): Promise<void> {
  try {
    const endereco = await this.cepService.buscarCepAsync('01310-100');
    console.log(endereco);
  } catch (error: any) {
    console.error(error.message);
  }
}
```

### 4. Validar se CEP Existe

```typescript
validarCep(): void {
  this.cepService.cepExiste('01310-100').subscribe({
    next: (existe) => {
      if (existe) {
        console.log('CEP encontrado!');
      } else {
        console.log('CEP não existe');
      }
    }
  });
}
```

## 💡 Exemplo Completo: Formulário com Preenchimento Automático

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { CepService } from '@app/shared/services/cep';
import { Toast } from '@app/shared/services/toast';
import { MASKS } from '@app/shared/constants/masks';
import { cepValidator } from '@app/shared/validators';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective],
  template: `
    <form [formGroup]="form" class="p-fluid">
      <!-- Campo CEP com busca -->
      <div class="field">
        <label htmlFor="cep">CEP *</label>
        <div class="p-inputgroup">
          <input
            pInputText
            id="cep"
            formControlName="cep"
            [mask]="MASKS.CEP"
            placeholder="00000-000"
            (blur)="buscarCep()"
          />
          <button
            pButton
            type="button"
            icon="pi pi-search"
            (click)="buscarCep()"
            [loading]="buscando"
          ></button>
        </div>
        @if (form.get('cep')?.errors?.['cep']) {
          <small class="p-error">CEP inválido</small>
        }
      </div>

      <!-- Campos preenchidos automaticamente -->
      <div class="field">
        <label htmlFor="logradouro">Logradouro *</label>
        <input pInputText id="logradouro" formControlName="logradouro" />
      </div>

      <div class="field">
        <label htmlFor="numero">Número *</label>
        <input pInputText id="numero" formControlName="numero" />
      </div>

      <div class="field">
        <label htmlFor="complemento">Complemento</label>
        <input pInputText id="complemento" formControlName="complemento" />
      </div>

      <div class="field">
        <label htmlFor="bairro">Bairro *</label>
        <input pInputText id="bairro" formControlName="bairro" />
      </div>

      <div class="field">
        <label htmlFor="cidade">Cidade *</label>
        <input
          pInputText
          id="cidade"
          formControlName="cidade"
          [readonly]="true"
          class="bg-gray-100"
        />
      </div>

      <div class="field">
        <label htmlFor="estado">Estado *</label>
        <input
          pInputText
          id="estado"
          formControlName="estado"
          [readonly]="true"
          class="bg-gray-100"
        />
      </div>

      <button pButton type="submit" label="Salvar" [disabled]="form.invalid"></button>
    </form>
  `,
})
export class ClienteFormComponent {
  private fb = inject(FormBuilder);
  private cepService = inject(CepService);
  private toast = inject(Toast);

  readonly MASKS = MASKS;
  buscando = false;

  form = this.fb.group({
    cep: ['', [Validators.required, cepValidator()]],
    logradouro: ['', Validators.required],
    numero: ['', Validators.required],
    complemento: [''],
    bairro: ['', Validators.required],
    cidade: [{ value: '', disabled: true }, Validators.required],
    estado: [{ value: '', disabled: true }, Validators.required],
    uf: [''],
  });

  buscarCep(): void {
    const cep = this.form.get('cep')?.value;

    if (!cep || this.form.get('cep')?.invalid) {
      return;
    }

    this.buscando = true;

    this.cepService.buscarCep(cep).subscribe({
      next: (endereco) => {
        // Preenche automaticamente os campos
        this.form.patchValue({
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
          uf: endereco.uf,
          complemento: endereco.complemento || '',
        });

        // Foca no campo número
        setTimeout(() => document.getElementById('numero')?.focus(), 100);

        this.toast.success('CEP encontrado', 'Endereço preenchido automaticamente');
        this.buscando = false;
      },
      error: (error) => {
        this.toast.error('Erro', error.message);
        this.limparEndereco();
        this.buscando = false;
      },
    });
  }

  private limparEndereco(): void {
    this.form.patchValue({
      logradouro: '',
      bairro: '',
      cidade: '',
      estado: '',
      uf: '',
      complemento: '',
    });
  }
}
```

## 📋 Métodos Disponíveis

### `buscarCep(cep: string): Observable<Endereco>`
Busca endereço pelo CEP (com Observable).

```typescript
this.cepService.buscarCep('01310-100').subscribe(endereco => {
  console.log(endereco.logradouro); // "Avenida Paulista"
});
```

### `buscarCepAsync(cep: string): Promise<Endereco>`
Busca endereço pelo CEP (com Promise/async-await).

```typescript
const endereco = await this.cepService.buscarCepAsync('01310-100');
console.log(endereco.cidade); // "São Paulo"
```

### `cepExiste(cep: string): Observable<boolean>`
Verifica se CEP existe.

```typescript
this.cepService.cepExiste('01310-100').subscribe(existe => {
  console.log(existe); // true ou false
});
```

### `formatarCep(cep: string): string`
Formata CEP para exibição.

```typescript
const formatado = this.cepService.formatarCep('01310100');
console.log(formatado); // "01310-100"
```

## 🎯 Modelo de Dados

### Interface `Endereco`

```typescript
interface Endereco {
  cep: string;          // "01310100"
  logradouro: string;   // "Avenida Paulista"
  numero?: string;      // "1000"
  complemento?: string; // "Apto 12"
  bairro: string;       // "Bela Vista"
  cidade: string;       // "São Paulo"
  estado: string;       // "São Paulo"
  uf: string;           // "SP"
  ibge?: string;        // "3550308"
  ddd?: string;         // "11"
}
```

## ⚠️ Tratamento de Erros

O serviço trata os seguintes erros:

| Erro | Mensagem |
|------|----------|
| CEP inválido | "CEP inválido. Deve conter 8 dígitos." |
| CEP não encontrado | "CEP não encontrado" |
| Sem conexão | "Erro de conexão. Verifique sua internet." |
| Limite de requisições | "Muitas requisições. Tente novamente em alguns instantes." |
| Serviço indisponível | "Serviço de CEP temporariamente indisponível" |

```typescript
this.cepService.buscarCep(cep).subscribe({
  next: (endereco) => {
    // Sucesso
  },
  error: (error) => {
    // error.message contém a mensagem tratada
    this.toast.error('Erro ao buscar CEP', error.message);
  }
});
```

## 🔧 Configuração

### Timeout e Retry

```typescript
private readonly TIMEOUT_MS = 10000;    // 10 segundos
private readonly RETRY_ATTEMPTS = 2;    // 2 tentativas
```

### Cache (Opcional)

Para implementar cache de CEPs:

```typescript
import { shareReplay } from 'rxjs/operators';

private cepCache = new Map<string, Observable<Endereco>>();

buscarCep(cep: string): Observable<Endereco> {
  const cepLimpo = this.limparCep(cep);
  
  if (!this.cepCache.has(cepLimpo)) {
    const request$ = this.http.get<ViaCepResponse>(...).pipe(
      shareReplay(1) // Cache da resposta
    );
    this.cepCache.set(cepLimpo, request$);
  }
  
  return this.cepCache.get(cepLimpo)!;
}
```

## 💡 Dicas de UX

### 1. Busca Automática no Blur

```html
<input formControlName="cep" [mask]="MASKS.CEP" (blur)="buscarCep()" />
```

### 2. Botão de Busca Manual

```html
<div class="p-inputgroup">
  <input formControlName="cep" [mask]="MASKS.CEP" />
  <button pButton icon="pi pi-search" (click)="buscarCep()"></button>
</div>
```

### 3. Loading Indicator

```typescript
buscando = false;

buscarCep() {
  this.buscando = true;
  this.cepService.buscarCep(cep).subscribe({
    next: () => this.buscando = false,
    error: () => this.buscando = false
  });
}
```

### 4. Feedback Visual

```typescript
// Sucesso
this.toast.success('CEP encontrado', 'Endereço preenchido');

// Erro
this.toast.error('CEP não encontrado', error.message);
```

### 5. Foco Automático

```typescript
// Após preencher, foca no próximo campo
setTimeout(() => document.getElementById('numero')?.focus(), 100);
```

### 6. Campos Readonly

```html
<!-- Cidade e estado não devem ser editáveis -->
<input formControlName="cidade" [readonly]="true" class="bg-gray-100" />
<input formControlName="estado" [readonly]="true" class="bg-gray-100" />
```

## 🧪 Testando

### CEPs para Teste

```typescript
// CEP válido
'01310-100' // Av. Paulista, São Paulo - SP

// CEP não encontrado
'99999-999'

// CEP inválido
'123' // Menos de 8 dígitos
'abcdefgh' // Não numérico
```

## 📚 Mais Exemplos

Veja [cep.examples.ts](cep.examples.ts) para exemplos completos incluindo:
- Formulários com preenchimento automático
- Busca com async/await
- Validação de CEP
- Integração com Loading e Toast
- Tratamento de erros

## 🔗 Links Úteis

- [Documentação ViaCEP](https://viacep.com.br/)
- [Validador de CEP](../validators/cep-validator.ts)
- [Máscara de CEP](../constants/masks.ts)
