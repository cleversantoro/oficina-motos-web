import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores para e-mail
 */

/**
 * Regex para validação de e-mail (RFC 5322 simplificado)
 * Aceita formatos comuns de e-mail
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Valida formato de e-mail
 * Mais robusto que o Validators.email nativo do Angular
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Campo vazio não é validado aqui
    }

    const email = value.trim().toLowerCase();

    // Validação básica de formato
    if (!EMAIL_REGEX.test(email)) {
      return { email: { message: 'E-mail inválido' } };
    }

    // Validações adicionais
    const [localPart, domain] = email.split('@');

    // Local part não pode começar ou terminar com ponto
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return { email: { message: 'E-mail inválido' } };
    }

    // Não pode ter pontos consecutivos
    if (localPart.includes('..')) {
      return { email: { message: 'E-mail inválido' } };
    }

    // Domínio deve ter pelo menos um ponto
    if (!domain.includes('.')) {
      return { email: { message: 'E-mail inválido' } };
    }

    // Extensão do domínio deve ter pelo menos 2 caracteres
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return { email: { message: 'E-mail inválido' } };
    }

    return null; // E-mail válido
  };
}

/**
 * Valida se e-mail pertence a domínios corporativos específicos
 * Útil para restringir cadastros apenas a e-mails corporativos
 */
export function corporateEmailValidator(allowedDomains: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const email = value.trim().toLowerCase();
    const domain = email.split('@')[1];

    if (!domain || !allowedDomains.includes(domain)) {
      return {
        corporateEmail: {
          message: `E-mail deve ser de um dos domínios: ${allowedDomains.join(', ')}`,
        },
      };
    }

    return null;
  };
}

/**
 * Valida se e-mail NÃO pertence a domínios descartáveis/temporários
 * Lista comum de provedores de e-mail temporário
 */
const DISPOSABLE_EMAIL_DOMAINS = [
  'guerrillamail.com',
  '10minutemail.com',
  'temp-mail.org',
  'throwaway.email',
  'maildrop.cc',
  'mohmal.com',
  'mailinator.com',
  'tempmail.com',
];

export function noDisposableEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const email = value.trim().toLowerCase();
    const domain = email.split('@')[1];

    if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
      return {
        disposableEmail: {
          message: 'E-mails temporários não são permitidos',
        },
      };
    }

    return null;
  };
}

/**
 * Helper para verificar se e-mail é válido (uso programático)
 */
export function isEmailValid(email: string): boolean {
  if (!email) return false;

  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) return false;

  const [localPart, domain] = trimmed.split('@');

  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return false;
  }

  if (!domain.includes('.')) return false;

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;

  return true;
}

/**
 * Helper para normalizar e-mail (remove espaços, converte para minúsculo)
 */
export function normalizeEmail(email: string): string {
  return email?.trim().toLowerCase() || '';
}
