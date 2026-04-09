import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores para documentos brasileiros (CPF e CNPJ)
 */

/**
 * Remove caracteres não numéricos
 */
function cleanDocument(value: string): string {
  return value?.replace(/\D/g, '') || '';
}

/**
 * Valida CPF usando algoritmo de dígitos verificadores
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Campo vazio não é validado aqui (use Validators.required)
    }

    const cpf = cleanDocument(value);

    // CPF deve ter exatamente 11 dígitos
    if (cpf.length !== 11) {
      return { cpf: { message: 'CPF deve conter 11 dígitos' } };
    }

    // Rejeita CPFs com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { cpf: { message: 'CPF inválido' } };
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;

    if (parseInt(cpf.charAt(9)) !== firstDigit) {
      return { cpf: { message: 'CPF inválido' } };
    }

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) secondDigit = 0;

    if (parseInt(cpf.charAt(10)) !== secondDigit) {
      return { cpf: { message: 'CPF inválido' } };
    }

    return null; // CPF válido
  };
}

/**
 * Valida CNPJ usando algoritmo de dígitos verificadores
 */
export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Campo vazio não é validado aqui
    }

    const cnpj = cleanDocument(value);

    // CNPJ deve ter exatamente 14 dígitos
    if (cnpj.length !== 14) {
      return { cnpj: { message: 'CNPJ deve conter 14 dígitos' } };
    }

    // Rejeita CNPJs com todos os dígitos iguais
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return { cnpj: { message: 'CNPJ inválido' } };
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (parseInt(cnpj.charAt(12)) !== firstDigit) {
      return { cnpj: { message: 'CNPJ inválido' } };
    }

    // Validação do segundo dígito verificador
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (parseInt(cnpj.charAt(13)) !== secondDigit) {
      return { cnpj: { message: 'CNPJ inválido' } };
    }

    return null; // CNPJ válido
  };
}

/**
 * Valida CPF ou CNPJ automaticamente baseado no tamanho
 */
export function cpfCnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const cleaned = cleanDocument(value);

    // Detecta se é CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (cleaned.length === 11) {
      return cpfValidator()(control);
    } else if (cleaned.length === 14) {
      return cnpjValidator()(control);
    } else {
      return {
        cpfCnpj: {
          message: 'Documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)',
        },
      };
    }
  };
}

/**
 * Helper para verificar se CPF é válido (uso programático)
 */
export function isCpfValid(cpf: string): boolean {
  const cleaned = cleanDocument(cpf);
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  if (parseInt(cleaned.charAt(9)) !== firstDigit) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  if (parseInt(cleaned.charAt(10)) !== secondDigit) return false;

  return true;
}

/**
 * Helper para verificar se CNPJ é válido (uso programático)
 */
export function isCnpjValid(cnpj: string): boolean {
  const cleaned = cleanDocument(cnpj);
  if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cleaned.charAt(12)) !== firstDigit) return false;

  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cleaned.charAt(13)) !== secondDigit) return false;

  return true;
}
