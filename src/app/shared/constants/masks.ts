/**
 * Constantes de máscaras de input usando ngx-mask
 *
 * Formato ngx-mask:
 * - 0: dígito numérico (0-9)
 * - A: letra maiúscula ou minúscula (A-Z, a-z)
 * - S: letra ou dígito
 * - *: qualquer caractere
 */

/**
 * Máscaras de documentos
 */
export const MASKS = {
  /** CPF: 000.000.000-00 */
  CPF: '000.000.000-00',

  /** CNPJ: 00.000.000/0000-00 */
  CNPJ: '00.000.000/0000-00',

  /** CPF ou CNPJ (dinâmico baseado no tamanho) */
  CPF_CNPJ: '000.000.000-00||00.000.000/0000-00',

  /**
   * Telefones
   */
  /** Telefone fixo: (00) 0000-0000 */
  TELEFONE_FIXO: '(00) 0000-0000',

  /** Celular: (00) 00000-0000 */
  CELULAR: '(00) 00000-0000',

  /** Telefone dinâmico (fixo ou celular) */
  TELEFONE: '(00) 0000-0000||(00) 00000-0000',

  /**
   * Endereço
   */
  /** CEP: 00000-000 */
  CEP: '00000-000',

  /**
   * Veículos
   */
  /** Placa Mercosul: AAA0A00 */
  PLACA_MERCOSUL: 'AAA0A00',

  /** Placa antiga: AAA-0000 */
  PLACA_ANTIGA: 'AAA-0000',

  /** Placa (aceita ambos formatos) */
  PLACA: 'SSS-0S00',

  /** Chassi: 17 caracteres alfanuméricos */
  CHASSI: 'SSSSSSSSSSSSSSSSS',

  /** RENAVAM: 11 dígitos */
  RENAVAM: '00000000000',

  /**
   * Outros
   */
  /** Data: dd/mm/yyyy */
  DATA: '00/00/0000',

  /** Hora: hh:mm */
  HORA: '00:00',

  /** Data e hora: dd/mm/yyyy hh:mm */
  DATA_HORA: '00/00/0000 00:00',

  /** Moeda brasileira com 2 casas decimais */
  MOEDA: 'separator.2',

  /** Percentual com 2 casas decimais */
  PERCENTUAL: 'separator.2',
} as const;

/**
 * Padrões de validação regex para máscaras
 */
export const MASK_PATTERNS = {
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  TELEFONE_FIXO: /^\(\d{2}\) \d{4}-\d{4}$/,
  CELULAR: /^\(\d{2}\) \d{5}-\d{4}$/,
  CEP: /^\d{5}-\d{3}$/,
  PLACA_MERCOSUL: /^[A-Z]{3}\d[A-Z]\d{2}$/,
  PLACA_ANTIGA: /^[A-Z]{3}-\d{4}$/,
  DATA: /^\d{2}\/\d{2}\/\d{4}$/,
  HORA: /^\d{2}:\d{2}$/,
} as const;

/**
 * Opções customizadas para máscaras específicas
 */
export const MASK_OPTIONS = {
  /** Remove separadores de valores monetários e percentuais */
  MOEDA: {
    thousandSeparator: '.',
    decimalMarker: ',',
    allowNegativeNumbers: false,
  },

  /** Permite letras maiúsculas e minúsculas para placas */
  PLACA: {
    patterns: {
      'S': { pattern: /[A-Za-z0-9]/ },
    },
  },
} as const;

/**
 * Helper para limpar máscaras (remover caracteres especiais)
 */
export function removeMask(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/[^\w]/g, '');
}

/**
 * Helper para detectar se é CPF ou CNPJ baseado no tamanho
 */
export function detectCpfCnpj(value: string): 'CPF' | 'CNPJ' | null {
  const cleaned = removeMask(value);
  if (cleaned.length === 11) return 'CPF';
  if (cleaned.length === 14) return 'CNPJ';
  return null;
}

/**
 * Helper para detectar se é telefone fixo ou celular
 */
export function detectTelefone(value: string): 'FIXO' | 'CELULAR' | null {
  const cleaned = removeMask(value);
  if (cleaned.length === 10) return 'FIXO';
  if (cleaned.length === 11) return 'CELULAR';
  return null;
}

/**
 * Helper para formatar moeda (valor numérico para string formatada)
 */
export function formatMoeda(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Helper para parsear moeda (string formatada para número)
 */
export function parseMoeda(value: string | null | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}
