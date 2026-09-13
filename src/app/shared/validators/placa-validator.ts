import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Remove caracteres especiais e normaliza para caixa alta
 */
export function cleanPlaca(value: string | null | undefined): string {
  return value ? value.trim().toUpperCase() : '';
}

/**
 * Regex para o padrão Mercosul brasileiro: 3 letras, 1 dígito, 1 letra, 2 dígitos
 * Exemplos: BRA2E19, ABC1D23
 */
const MERCOSUL_REGEX = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

/**
 * Regex para o padrão tradicional brasileiro: 3 letras e 4 dígitos (com ou sem hífen)
 * Exemplos: ABC-1234, ABC1234
 */
const TRADICIONAL_REGEX = /^[A-Z]{3}-?[0-9]{4}$/;

/**
 * Verifica se a placa informada é válida nos padrões brasileiros (Mercosul ou Tradicional)
 */
export function isPlacaValid(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = cleanPlaca(value);
  return MERCOSUL_REGEX.test(normalized) || TRADICIONAL_REGEX.test(normalized);
}

/**
 * Validador de placa veicular para formulários reativos do Angular
 */
export function placaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return null; // Campo vazio não é invalidado aqui (use Validators.required)
    }

    if (!isPlacaValid(value)) {
      return {
        placa: {
          message: 'Placa inválida. Utilize o formato Mercosul (ABC1D23) ou tradicional (ABC-1234)',
        },
      };
    }

    return null;
  };
}
