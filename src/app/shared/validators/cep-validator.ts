import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores para CEP (Código de Endereçamento Postal)
 */

/**
 * Remove caracteres não numéricos
 */
function cleanCep(value: string): string {
  return value?.replace(/\D/g, '') || '';
}

/**
 * Valida formato de CEP brasileiro
 * CEP deve ter exatamente 8 dígitos
 * Formato: XXXXX-XXX
 */
export function cepValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Campo vazio não é validado aqui
    }

    const cep = cleanCep(value);

    // CEP deve ter exatamente 8 dígitos
    if (cep.length !== 8) {
      return {
        cep: {
          message: 'CEP deve conter 8 dígitos',
        },
      };
    }

    // Não pode ter todos os dígitos iguais
    if (/^(\d)\1{7}$/.test(cep)) {
      return { cep: { message: 'CEP inválido' } };
    }

    // CEP não pode começar com 0
    if (cep.startsWith('0')) {
      return { cep: { message: 'CEP inválido' } };
    }

    return null; // CEP válido
  };
}

/**
 * Valida CEP e verifica se existe via API ViaCEP
 * IMPORTANTE: Este é um validador assíncrono
 * Requer injeção do serviço de CEP
 */
export function cepExistsValidator(cepService: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const cep = cleanCep(value);

    if (cep.length !== 8) {
      return { cep: { message: 'CEP deve conter 8 dígitos' } };
    }

    // Esta validação deveria ser assíncrona
    // Para implementar completamente, use AsyncValidatorFn
    // Aqui apenas validamos o formato

    return null;
  };
}

/**
 * Helper para verificar se CEP é válido (uso programático)
 */
export function isCepValid(cep: string): boolean {
  const cleaned = cleanCep(cep);

  if (cleaned.length !== 8) {
    return false;
  }

  if (/^(\d)\1{7}$/.test(cleaned)) {
    return false;
  }

  if (cleaned.startsWith('0')) {
    return false;
  }

  return true;
}

/**
 * Helper para formatar CEP
 * De: 12345678 Para: 12345-678
 */
export function formatCep(cep: string): string {
  const cleaned = cleanCep(cep);

  if (cleaned.length === 8) {
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
  }

  return cep;
}

/**
 * Helper para extrair apenas números do CEP
 */
export function extractCepNumbers(cep: string): string {
  return cleanCep(cep);
}

/**
 * Validador assíncrono para verificar se CEP existe (exemplo)
 * Use este padrão para validação assíncrona com API
 */
/*
import { AsyncValidatorFn } from '@angular/forms';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export function cepAsyncValidator(cepService: CepService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    const cep = cleanCep(control.value);

    if (cep.length !== 8) {
      return of({ cep: { message: 'CEP deve conter 8 dígitos' } });
    }

    return cepService.buscar(cep).pipe(
      map(response => {
        // Se retornou erro, CEP não existe
        if (response.erro) {
          return { cepNotFound: { message: 'CEP não encontrado' } };
        }
        return null; // CEP válido e existe
      }),
      catchError(() => of({ cepError: { message: 'Erro ao validar CEP' } }))
    );
  };
}
*/
