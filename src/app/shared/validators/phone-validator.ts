import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores para telefones brasileiros
 */

/**
 * Remove caracteres não numéricos
 */
function cleanPhone(value: string): string {
  return value?.replace(/\D/g, '') || '';
}

/**
 * DDDs válidos no Brasil
 */
const VALID_DDD = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19', // São Paulo
  '21', '22', '24', // Rio de Janeiro
  '27', '28', // Espírito Santo
  '31', '32', '33', '34', '35', '37', '38', // Minas Gerais
  '41', '42', '43', '44', '45', '46', // Paraná
  '47', '48', '49', // Santa Catarina
  '51', '53', '54', '55', // Rio Grande do Sul
  '61', // Distrito Federal
  '62', '64', // Goiás
  '63', // Tocantins
  '65', '66', // Mato Grosso
  '67', // Mato Grosso do Sul
  '68', // Acre
  '69', // Rondônia
  '71', '73', '74', '75', '77', // Bahia
  '79', // Sergipe
  '81', '87', // Pernambuco
  '82', // Alagoas
  '83', // Paraíba
  '84', // Rio Grande do Norte
  '85', '88', // Ceará
  '86', '89', // Piauí
  '91', '93', '94', // Pará
  '92', '97', // Amazonas
  '95', // Roraima
  '96', // Amapá
  '98', '99', // Maranhão
];

/**
 * Valida telefone celular brasileiro (11 dígitos)
 * Formato: (XX) 9XXXX-XXXX
 */
export function celularValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Campo vazio não é validado aqui
    }

    const phone = cleanPhone(value);

    // Celular deve ter exatamente 11 dígitos
    if (phone.length !== 11) {
      return {
        celular: {
          message: 'Celular deve conter 11 dígitos (DDD + 9 dígitos)',
        },
      };
    }

    // Valida DDD
    const ddd = phone.substring(0, 2);
    if (!VALID_DDD.includes(ddd)) {
      return { celular: { message: 'DDD inválido' } };
    }

    // Celular deve começar com 9
    if (phone.charAt(2) !== '9') {
      return {
        celular: {
          message: 'Celular deve começar com 9 após o DDD',
        },
      };
    }

    // Não pode ter todos os dígitos iguais após o DDD
    const numero = phone.substring(2);
    if (/^(\d)\1{8}$/.test(numero)) {
      return { celular: { message: 'Número de celular inválido' } };
    }

    return null; // Celular válido
  };
}

/**
 * Valida telefone fixo brasileiro (10 dígitos)
 * Formato: (XX) XXXX-XXXX
 */
export function telefoneFixoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const phone = cleanPhone(value);

    // Fixo deve ter exatamente 10 dígitos
    if (phone.length !== 10) {
      return {
        telefoneFixo: {
          message: 'Telefone fixo deve conter 10 dígitos (DDD + 8 dígitos)',
        },
      };
    }

    // Valida DDD
    const ddd = phone.substring(0, 2);
    if (!VALID_DDD.includes(ddd)) {
      return { telefoneFixo: { message: 'DDD inválido' } };
    }

    // Primeiro dígito do número não pode ser 0 ou 1
    const primeiroDigito = phone.charAt(2);
    if (primeiroDigito === '0' || primeiroDigito === '1') {
      return { telefoneFixo: { message: 'Telefone fixo inválido' } };
    }

    // Não pode ter todos os dígitos iguais após o DDD
    const numero = phone.substring(2);
    if (/^(\d)\1{7}$/.test(numero)) {
      return { telefoneFixo: { message: 'Número de telefone inválido' } };
    }

    return null; // Fixo válido
  };
}

/**
 * Valida telefone brasileiro (fixo ou celular)
 * Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
 */
export function telefoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const phone = cleanPhone(value);

    // Deve ter 10 (fixo) ou 11 (celular) dígitos
    if (phone.length !== 10 && phone.length !== 11) {
      return {
        telefone: {
          message: 'Telefone deve conter 10 dígitos (fixo) ou 11 dígitos (celular)',
        },
      };
    }

    // Valida DDD
    const ddd = phone.substring(0, 2);
    if (!VALID_DDD.includes(ddd)) {
      return { telefone: { message: 'DDD inválido' } };
    }

    // Se for celular (11 dígitos), valida formato de celular
    if (phone.length === 11) {
      return celularValidator()(control);
    }

    // Se for fixo (10 dígitos), valida formato de fixo
    if (phone.length === 10) {
      return telefoneFixoValidator()(control);
    }

    return null;
  };
}

/**
 * Helper para verificar se telefone é válido (uso programático)
 */
export function isTelefoneValid(phone: string): boolean {
  const cleaned = cleanPhone(phone);

  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return false;
  }

  const ddd = cleaned.substring(0, 2);
  if (!VALID_DDD.includes(ddd)) {
    return false;
  }

  if (cleaned.length === 11) {
    // Celular
    if (cleaned.charAt(2) !== '9') return false;
    const numero = cleaned.substring(2);
    if (/^(\d)\1{8}$/.test(numero)) return false;
  } else {
    // Fixo
    const primeiroDigito = cleaned.charAt(2);
    if (primeiroDigito === '0' || primeiroDigito === '1') return false;
    const numero = cleaned.substring(2);
    if (/^(\d)\1{7}$/.test(numero)) return false;
  }

  return true;
}

/**
 * Helper para verificar se é celular
 */
export function isCelular(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  return cleaned.length === 11 && cleaned.charAt(2) === '9';
}

/**
 * Helper para verificar se é fixo
 */
export function isTelefoneFixo(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  return cleaned.length === 10;
}

/**
 * Helper para formatar telefone
 */
export function formatTelefone(phone: string): string {
  const cleaned = cleanPhone(phone);

  if (cleaned.length === 11) {
    // Celular: (XX) 9XXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }

  return phone;
}
