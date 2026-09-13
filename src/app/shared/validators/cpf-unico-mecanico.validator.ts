import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { isCpfValid } from './document-validator';

/**
 * Remove caracteres não numéricos de qualquer documento
 */
function cleanDigits(value: string | null | undefined): string {
  return value?.replace(/\D/g, '') || '';
}

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export function formatCpf(cpf: string | null | undefined): string {
  const cleaned = cleanDigits(cpf);
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}`;
  }
  return cpf || '';
}

export interface MecanicoDocumentoItem {
  id?: number | string | null;
  documentoPrincipal?: string | null;
  cpf?: string | null;
}

export type MecanicosFonte =
  | MecanicoDocumentoItem[]
  | string[]
  | (() => MecanicoDocumentoItem[] | string[]);

/**
 * Validador síncrono que verifica tanto a validade matemática do CPF
 * quanto a sua unicidade na base de mecânicos.
 *
 * @param fonte Array de mecânicos/CPFs ou função que retorna a lista atualizada (ex.: Signal getter).
 * @param mecanicoIdAtual ID do mecânico que está sendo editado (opcional, para permitir manter o próprio CPF).
 */
export function cpfUnicoMecanicoValidator(
  fonte: MecanicosFonte,
  mecanicoIdAtual?: number | string | null
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Campo vazio não é validado aqui (use Validators.required)
    }

    const cpfLimpo = cleanDigits(value);

    // Validação de comprimento
    if (cpfLimpo.length !== 11) {
      return { cpf: { message: 'CPF deve conter 11 dígitos' } };
    }

    // Validação do algoritmo de dígitos verificadores
    if (!isCpfValid(cpfLimpo)) {
      return { cpf: { message: 'CPF inválido' } };
    }

    // Obtenção da lista atual de mecânicos
    const lista = typeof fonte === 'function' ? fonte() : fonte;
    if (!lista || !Array.isArray(lista)) {
      return null;
    }

    // Checagem de duplicidade
    const existeDuplicado = lista.some((item) => {
      if (!item) return false;

      if (typeof item === 'string') {
        return cleanDigits(item) === cpfLimpo;
      }

      // Se for o próprio registro sendo editado, ignora
      if (
        mecanicoIdAtual !== undefined &&
        mecanicoIdAtual !== null &&
        item.id !== undefined &&
        item.id !== null &&
        String(item.id) === String(mecanicoIdAtual)
      ) {
        return false;
      }

      const docItem = cleanDigits(item.documentoPrincipal || item.cpf);
      return docItem === cpfLimpo;
    });

    if (existeDuplicado) {
      return {
        cpfDuplicado: {
          message: 'Este CPF já está cadastrado para outro mecânico.',
        },
      };
    }

    return null;
  };
}

/**
 * Validador assíncrono para verificar unicidade de CPF através de serviço de API.
 */
export function cpfUnicoMecanicoAsyncValidator(
  service: { getAll?: () => Observable<any>; list?: () => Observable<any> },
  mecanicoIdAtual?: number | string | null
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;

    if (!value) {
      return of(null);
    }

    const cpfLimpo = cleanDigits(value);

    if (cpfLimpo.length !== 11) {
      return of({ cpf: { message: 'CPF deve conter 11 dígitos' } });
    }

    if (!isCpfValid(cpfLimpo)) {
      return of({ cpf: { message: 'CPF inválido' } });
    }

    const fetch$ = service.getAll ? service.getAll() : service.list ? service.list() : null;

    if (!fetch$) {
      return of(null);
    }

    return fetch$.pipe(
      map((res: any) => {
        const lista: any[] = Array.isArray(res) ? res : res?.data ?? [];
        const existe = lista.some((item) => {
          if (!item) return false;

          if (
            mecanicoIdAtual !== undefined &&
            mecanicoIdAtual !== null &&
            item.id !== undefined &&
            item.id !== null &&
            String(item.id) === String(mecanicoIdAtual)
          ) {
            return false;
          }

          const docItem = cleanDigits(item.documentoPrincipal || item.cpf);
          return docItem === cpfLimpo;
        });

        if (existe) {
          return {
            cpfDuplicado: {
              message: 'Este CPF já está cadastrado para outro mecânico.',
            },
          };
        }

        return null;
      }),
      catchError(() => of(null))
    );
  };
}

