# Input Masks - Guia de Uso

Sistema de máscaras de input usando ngx-mask para formulários Angular.

## 📦 Arquivos Criados

- **[shared/constants/masks.ts](masks.ts)** - Definições de todas as máscaras
- **[shared/constants/masks.examples.ts](masks.examples.ts)** - Exemplos completos de uso
- **[shared/constants/index.ts](index.ts)** - Barrel export
- **[app.config.ts](../../app.config.ts)** - Configuração do ngx-mask

## 🎭 Máscaras Disponíveis

### Documentos
| Campo | Máscara | Exemplo |
|-------|---------|---------|
| CPF | `000.000.000-00` | 123.456.789-00 |
| CNPJ | `00.000.000/0000-00` | 12.345.678/0001-90 |
| CPF/CNPJ | `000.000.000-00\|\|00.000.000/0000-00` | Dinâmico |

### Telefones
| Campo | Máscara | Exemplo |
|-------|---------|---------|
| Celular | `(00) 00000-0000` | (11) 98765-4321 |
| Fixo | `(00) 0000-0000` | (11) 3456-7890 |
| Telefone | `(00) 0000-0000\|\|(00) 00000-0000` | Dinâmico |

### Endereço
| Campo | Máscara | Exemplo |
|-------|---------|---------|
| CEP | `00000-000` | 12345-678 |

### Veículos
| Campo | Máscara | Exemplo |
|-------|---------|---------|
| Placa Mercosul | `AAA0A00` | ABC1D23 |
| Placa Antiga | `AAA-0000` | ABC-1234 |
| Placa (ambas) | `SSS-0S00` | ABC-1234 ou ABC1D23 |
| Chassi | `SSSSSSSSSSSSSSSSS` | 9BWZZZ377VT004251 |
| RENAVAM | `00000000000` | 12345678901 |

### Datas e Valores
| Campo | Máscara | Exemplo |
|-------|---------|---------|
| Data | `00/00/0000` | 31/12/2024 |
| Hora | `00:00` | 14:30 |
| Data/Hora | `00/00/0000 00:00` | 31/12/2024 14:30 |
| Moeda | `separator.2` | 1.234,56 |
| Percentual | `separator.2` | 15,50 |

## 🚀 Como Usar

### 1. Importar no Componente

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { MASKS, removeMask } from '@app/shared/constants/masks';

@Component({
  selector: 'app-meu-componente',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective],
  // ...
})
export class MeuComponente {
  readonly MASKS = MASKS; // Expor para o template
}
```

### 2. Usar no Template

```html
<!-- CPF -->
<input
  formControlName="cpf"
  [mask]="MASKS.CPF"
  placeholder="000.000.000-00"
/>

<!-- Telefone -->
<input
  formControlName="telefone"
  [mask]="MASKS.CELULAR"
  placeholder="(00) 00000-0000"
/>

<!-- CEP -->
<input
  formControlName="cep"
  [mask]="MASKS.CEP"
  placeholder="00000-000"
/>

<!-- Placa de veículo -->
<input
  formControlName="placa"
  [mask]="MASKS.PLACA"
  placeholder="AAA-0000 ou AAA0A00"
  style="text-transform: uppercase"
/>
```

### 3. Remover Máscara ao Salvar

```typescript
salvar() {
  const formData = this.form.getRawValue();
  
  const dados = {
    cpf: removeMask(formData.cpf),        // "12345678900"
    telefone: removeMask(formData.telefone), // "11987654321"
    cep: removeMask(formData.cep),        // "12345678"
  };
  
  // Enviar dados limpos para API
  this.service.salvar(dados).subscribe();
}
```

## 💡 Exemplos Práticos

### Formulário de Cliente

```typescript
@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective],
  template: `
    <form [formGroup]="form" class="p-fluid">
      <div class="field">
        <label htmlFor="cpf">CPF</label>
        <input pInputText id="cpf" formControlName="cpf" [mask]="MASKS.CPF" />
      </div>

      <div class="field">
        <label htmlFor="telefone">Celular</label>
        <input pInputText id="telefone" formControlName="telefone" [mask]="MASKS.CELULAR" />
      </div>

      <div class="field">
        <label htmlFor="cep">CEP</label>
        <input pInputText id="cep" formControlName="cep" [mask]="MASKS.CEP" (blur)="buscarCep()" />
      </div>
    </form>
  `,
})
export class ClienteFormComponent {
  readonly MASKS = MASKS;

  form = this.fb.group({
    cpf: ['', Validators.required],
    telefone: ['', Validators.required],
    cep: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private cepService: CepService) {}

  buscarCep() {
    const cep = removeMask(this.form.get('cep')?.value);
    this.cepService.buscar(cep).subscribe(endereco => {
      this.form.patchValue(endereco);
    });
  }
}
```

### Formulário de Veículo

```typescript
@Component({
  selector: 'app-veiculo-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective],
  template: `
    <form [formGroup]="form" class="p-fluid">
      <div class="field">
        <label htmlFor="placa">Placa</label>
        <input
          pInputText
          id="placa"
          formControlName="placa"
          [mask]="MASKS.PLACA"
          style="text-transform: uppercase"
        />
      </div>

      <div class="field">
        <label htmlFor="renavam">RENAVAM</label>
        <input pInputText id="renavam" formControlName="renavam" [mask]="MASKS.RENAVAM" />
      </div>
    </form>
  `,
})
export class VeiculoFormComponent {
  readonly MASKS = MASKS;

  form = this.fb.group({
    placa: ['', Validators.required],
    renavam: ['', Validators.required],
  });

  constructor(private fb: FormBuilder) {}
}
```

### Campo Monetário

```typescript
<div class="field">
  <label htmlFor="valor">Valor do Serviço</label>
  <div class="p-inputgroup">
    <span class="p-inputgroup-addon">R$</span>
    <input
      pInputText
      id="valor"
      formControlName="valor"
      [mask]="MASKS.MOEDA"
      [thousandSeparator]="'.'"
      [decimalMarker]="','"
      placeholder="0,00"
    />
  </div>
</div>
```

## 🔧 Utilitários Disponíveis

### `removeMask(value: string): string`
Remove todos os caracteres especiais, deixando apenas números e letras.

```typescript
removeMask('123.456.789-00') // "12345678900"
removeMask('(11) 98765-4321') // "11987654321"
```

### `detectCpfCnpj(value: string): 'CPF' | 'CNPJ' | null`
Detecta automaticamente se é CPF ou CNPJ baseado no tamanho.

```typescript
detectCpfCnpj('123.456.789-00') // "CPF"
detectCpfCnpj('12.345.678/0001-90') // "CNPJ"
```

### `detectTelefone(value: string): 'FIXO' | 'CELULAR' | null`
Detecta se é telefone fixo ou celular.

```typescript
detectTelefone('(11) 3456-7890') // "FIXO"
detectTelefone('(11) 98765-4321') // "CELULAR"
```

### `formatMoeda(value: number): string`
Formata número para moeda brasileira.

```typescript
formatMoeda(1234.56) // "1.234,56"
```

### `parseMoeda(value: string): number`
Converte string formatada para número.

```typescript
parseMoeda('1.234,56') // 1234.56
```

## 📚 Opções Avançadas do ngx-mask

```html
<!-- Manter caracteres especiais no valor do FormControl -->
<input [mask]="MASKS.CPF" [dropSpecialCharacters]="false" />

<!-- Mostrar máscara enquanto digita -->
<input [mask]="MASKS.TELEFONE" [showMaskTyped]="true" />

<!-- Limpar campo se não bater com a máscara -->
<input [mask]="MASKS.CPF" [clearIfNotMatch]="true" />

<!-- Definir caracteres especiais permitidos -->
<input [mask]="MASKS.PLACA" [specialCharacters]="['-']" />

<!-- Prefix e Suffix -->
<input [mask]="MASKS.CELULAR" prefix="+55 " />
<input [mask]="MASKS.MOEDA" suffix=" kg" />
```

## 🎯 Integração com PrimeNG

Todas as máscaras funcionam perfeitamente com componentes PrimeNG:

```html
<!-- InputText -->
<input pInputText formControlName="cpf" [mask]="MASKS.CPF" />

<!-- InputMask (nativo do PrimeNG, alternativa) -->
<p-inputMask formControlName="telefone" mask="(99) 99999-9999" />

<!-- InputNumber para valores monetários -->
<p-inputNumber
  formControlName="valor"
  mode="currency"
  currency="BRL"
  locale="pt-BR"
/>
```

## ✅ Validação

Para validação de CPF/CNPJ, use os validators em `shared/validators/document-validator.ts`:

```typescript
import { documentValidator } from '@app/shared/validators/document-validator';

form = this.fb.group({
  cpf: ['', [Validators.required, documentValidator('cpf')]],
  cnpj: ['', [Validators.required, documentValidator('cnpj')]],
});
```

## 📖 Mais Exemplos

Veja [masks.examples.ts](masks.examples.ts) para exemplos completos e detalhados de uso.
