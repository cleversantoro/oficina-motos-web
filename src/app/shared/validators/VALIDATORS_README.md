# Validadores Customizados

Sistema completo de validadores para formulários Angular, otimizados para dados brasileiros.

## 📦 Validadores Disponíveis

### 1. **Documentos** (CPF/CNPJ)
- `cpfValidator()` - Valida CPF
- `cnpjValidator()` - Valida CNPJ
- `cpfCnpjValidator()` - Valida CPF ou CNPJ automaticamente

### 2. **E-mail**
- `emailValidator()` - Valida formato de e-mail
- `corporateEmailValidator(domains)` - Valida e-mails corporativos
- `noDisposableEmailValidator()` - Bloqueia e-mails temporários

### 3. **Telefone**
- `celularValidator()` - Valida celular (11 dígitos)
- `telefoneFixoValidator()` - Valida fixo (10 dígitos)
- `telefoneValidator()` - Valida fixo ou celular

### 4. **CEP**
- `cepValidator()` - Valida formato de CEP

## 🚀 Como Usar

### Importar Validadores

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  cpfValidator,
  cnpjValidator,
  emailValidator,
  telefoneValidator,
  cepValidator,
} from '@app/shared/validators';

@Component({
  selector: 'app-cliente-form',
  // ...
})
export class ClienteFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      cpf: ['', [Validators.required, cpfValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      telefone: ['', [Validators.required, telefoneValidator()]],
      cep: ['', [Validators.required, cepValidator()]],
    });
  }
}
```

## 📝 Exemplos Detalhados

### Exemplo 1: Formulário de Cliente

```typescript
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { MASKS } from '@app/shared/constants/masks';
import {
  cpfValidator,
  emailValidator,
  telefoneValidator,
  cepValidator,
} from '@app/shared/validators';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective],
  template: `
    <form [formGroup]="clienteForm" (ngSubmit)="salvar()" class="p-fluid">
      <!-- CPF com máscara e validação -->
      <div class="field">
        <label htmlFor="cpf">CPF *</label>
        <input
          pInputText
          id="cpf"
          formControlName="cpf"
          [mask]="MASKS.CPF"
          placeholder="000.000.000-00"
        />
        @if (clienteForm.get('cpf')?.errors?.['required'] && clienteForm.get('cpf')?.touched) {
          <small class="p-error">CPF é obrigatório</small>
        }
        @if (clienteForm.get('cpf')?.errors?.['cpf']) {
          <small class="p-error">{{ clienteForm.get('cpf')?.errors?.['cpf'].message }}</small>
        }
      </div>

      <!-- E-mail com validação -->
      <div class="field">
        <label htmlFor="email">E-mail *</label>
        <input
          pInputText
          id="email"
          type="email"
          formControlName="email"
          placeholder="email@exemplo.com"
        />
        @if (clienteForm.get('email')?.errors?.['required'] && clienteForm.get('email')?.touched) {
          <small class="p-error">E-mail é obrigatório</small>
        }
        @if (clienteForm.get('email')?.errors?.['email']) {
          <small class="p-error">{{ clienteForm.get('email')?.errors?.['email'].message }}</small>
        }
      </div>

      <!-- Telefone com máscara e validação -->
      <div class="field">
        <label htmlFor="telefone">Telefone *</label>
        <input
          pInputText
          id="telefone"
          formControlName="telefone"
          [mask]="MASKS.TELEFONE"
          placeholder="(00) 00000-0000"
        />
        @if (clienteForm.get('telefone')?.errors?.['telefone']) {
          <small class="p-error">{{ clienteForm.get('telefone')?.errors?.['telefone'].message }}</small>
        }
      </div>

      <!-- CEP com máscara e validação -->
      <div class="field">
        <label htmlFor="cep">CEP *</label>
        <input
          pInputText
          id="cep"
          formControlName="cep"
          [mask]="MASKS.CEP"
          placeholder="00000-000"
          (blur)="buscarCep()"
        />
        @if (clienteForm.get('cep')?.errors?.['cep']) {
          <small class="p-error">{{ clienteForm.get('cep')?.errors?.['cep'].message }}</small>
        }
      </div>

      <button
        pButton
        type="submit"
        label="Salvar"
        [disabled]="clienteForm.invalid"
      ></button>
    </form>
  `,
})
export class ClienteFormComponent {
  readonly MASKS = MASKS;

  clienteForm = this.fb.group({
    cpf: ['', [Validators.required, cpfValidator()]],
    email: ['', [Validators.required, emailValidator()]],
    telefone: ['', [Validators.required, telefoneValidator()]],
    cep: ['', [Validators.required, cepValidator()]],
  });

  constructor(private fb: FormBuilder) {}

  buscarCep() {
    const cep = this.clienteForm.get('cep')?.value;
    // Implementar busca de CEP
  }

  salvar() {
    if (this.clienteForm.valid) {
      console.log(this.clienteForm.value);
    }
  }
}
```

### Exemplo 2: CPF ou CNPJ Dinâmico

```typescript
import { cpfCnpjValidator } from '@app/shared/validators';

form = this.fb.group({
  // Valida automaticamente CPF (11 dígitos) ou CNPJ (14 dígitos)
  documento: ['', [Validators.required, cpfCnpjValidator()]],
});
```

```html
<input
  pInputText
  formControlName="documento"
  [mask]="MASKS.CPF_CNPJ"
  placeholder="CPF ou CNPJ"
/>
```

### Exemplo 3: E-mail Corporativo

```typescript
import { corporateEmailValidator } from '@app/shared/validators';

form = this.fb.group({
  email: [
    '',
    [
      Validators.required,
      emailValidator(),
      corporateEmailValidator(['empresa.com.br', 'empresa.com']),
    ],
  ],
});
```

### Exemplo 4: Validação de Telefone Específico

```typescript
import { celularValidator, telefoneFixoValidator } from '@app/shared/validators';

form = this.fb.group({
  celular: ['', [Validators.required, celularValidator()]],
  telefoneComercial: ['', telefoneFixoValidator()], // Opcional
});
```

### Exemplo 5: Bloquear E-mails Temporários

```typescript
import { noDisposableEmailValidator } from '@app/shared/validators';

form = this.fb.group({
  email: [
    '',
    [
      Validators.required,
      emailValidator(),
      noDisposableEmailValidator(),
    ],
  ],
});
```

## 🔧 Helpers Disponíveis

### Verificação de Validade (uso programático)

```typescript
import {
  isCpfValid,
  isCnpjValid,
  isEmailValid,
  isTelefoneValid,
  isCepValid,
} from '@app/shared/validators';

// Verificar se CPF é válido
if (isCpfValid('123.456.789-00')) {
  console.log('CPF válido!');
}

// Verificar se e-mail é válido
if (isEmailValid('usuario@exemplo.com')) {
  console.log('E-mail válido!');
}

// Verificar se telefone é válido
if (isTelefoneValid('(11) 98765-4321')) {
  console.log('Telefone válido!');
}
```

### Formatação

```typescript
import { formatTelefone, formatCep } from '@app/shared/validators';

// Formatar telefone
const telefoneFormatado = formatTelefone('11987654321');
// Resultado: (11) 98765-4321

// Formatar CEP
const cepFormatado = formatCep('12345678');
// Resultado: 12345-678
```

### Detecção de Tipo

```typescript
import { isCelular, isTelefoneFixo } from '@app/shared/validators';

if (isCelular('11987654321')) {
  console.log('É um celular');
}

if (isTelefoneFixo('1134567890')) {
  console.log('É um telefone fixo');
}
```

## 📋 Mensagens de Erro

Todos os validadores retornam mensagens de erro descritivas:

```typescript
// Exemplo de estrutura de erro
{
  cpf: { message: 'CPF inválido' },
  email: { message: 'E-mail inválido' },
  telefone: { message: 'Telefone deve conter 10 dígitos (fixo) ou 11 dígitos (celular)' },
  cep: { message: 'CEP deve conter 8 dígitos' }
}
```

Use no template:

```html
@if (form.get('cpf')?.errors?.['cpf']) {
  <small class="p-error">
    {{ form.get('cpf')?.errors?.['cpf'].message }}
  </small>
}
```

## ✅ Combinando com Máscaras

Use validadores junto com máscaras para melhor UX:

```html
<!-- CPF: máscara + validação -->
<input
  formControlName="cpf"
  [mask]="MASKS.CPF"
  placeholder="000.000.000-00"
/>

<!-- Telefone: máscara + validação -->
<input
  formControlName="telefone"
  [mask]="MASKS.TELEFONE"
  placeholder="(00) 00000-0000"
/>
```

## 🎯 Algoritmos de Validação

### CPF
- Verifica se tem 11 dígitos
- Rejeita sequências repetidas (111.111.111-11)
- Valida dígitos verificadores usando algoritmo oficial

### CNPJ
- Verifica se tem 14 dígitos
- Rejeita sequências repetidas
- Valida dígitos verificadores usando algoritmo oficial

### Telefone
- Valida DDD (todos os DDDs brasileiros válidos)
- Celular: deve começar com 9 após o DDD
- Fixo: não pode começar com 0 ou 1
- Rejeita números com todos os dígitos iguais

### CEP
- Verifica 8 dígitos
- Não pode começar com 0
- Rejeita sequências repetidas

## 🔗 Integração com Backend

Ao enviar dados para API, remova as máscaras:

```typescript
import { removeMask } from '@app/shared/constants/masks';

salvar() {
  const formValue = this.form.getRawValue();
  
  const dados = {
    cpf: removeMask(formValue.cpf),        // "12345678900"
    telefone: removeMask(formValue.telefone), // "11987654321"
    cep: removeMask(formValue.cep),        // "12345678"
  };
  
  this.service.salvar(dados).subscribe();
}
```

## 📚 Arquivos

- **[document-validator.ts](document-validator.ts)** - Validadores de CPF/CNPJ
- **[email-validator.ts](email-validator.ts)** - Validadores de e-mail
- **[phone-validator.ts](phone-validator.ts)** - Validadores de telefone
- **[cep-validator.ts](cep-validator.ts)** - Validadores de CEP
- **[index.ts](index.ts)** - Barrel export de todos os validadores

## 🧪 Testando Validadores

```typescript
import { FormControl } from '@angular/forms';
import { cpfValidator } from '@app/shared/validators';

// Válido
const control1 = new FormControl('123.456.789-09', cpfValidator());
console.log(control1.errors); // null (válido)

// Inválido
const control2 = new FormControl('123.456.789-00', cpfValidator());
console.log(control2.errors); // { cpf: { message: 'CPF inválido' } }
```
