/**
 * Barrel export para todos os validadores customizados
 */

// Validadores de documentos (CPF/CNPJ)
export {
  cpfValidator,
  cnpjValidator,
  cpfCnpjValidator,
  isCpfValid,
  isCnpjValid,
} from './document-validator';

// Validadores de e-mail
export {
  emailValidator,
  corporateEmailValidator,
  noDisposableEmailValidator,
  isEmailValid,
  normalizeEmail,
} from './email-validator';

// Validadores de telefone
export {
  celularValidator,
  telefoneFixoValidator,
  telefoneValidator,
  isTelefoneValid,
  isCelular,
  isTelefoneFixo,
  formatTelefone,
} from './phone-validator';

// Validadores de CEP
export {
  cepValidator,
  cepExistsValidator,
  isCepValid,
  formatCep,
  extractCepNumbers,
} from './cep-validator';
