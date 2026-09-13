import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { cleanPlaca, isPlacaValid, placaValidator } from './placa-validator';

describe('placaValidator', () => {
  describe('cleanPlaca', () => {
    it('deve remover espaços e converter para maiúsculas', () => {
      expect(cleanPlaca('  bra2e19  ')).toBe('BRA2E19');
      expect(cleanPlaca('abc-1234')).toBe('ABC-1234');
      expect(cleanPlaca('')).toBe('');
    });
  });

  describe('isPlacaValid', () => {
    it('deve aceitar placas válidas no padrão Mercosul', () => {
      expect(isPlacaValid('BRA2E19')).toBe(true);
      expect(isPlacaValid('ABC1D23')).toBe(true);
      expect(isPlacaValid('bra2e19')).toBe(true);
      expect(isPlacaValid('XYZ9W88')).toBe(true);
      expect(isPlacaValid('RIO2A18')).toBe(true);
    });

    it('deve aceitar placas válidas no padrão tradicional brasileiro', () => {
      expect(isPlacaValid('ABC-1234')).toBe(true);
      expect(isPlacaValid('ABC1234')).toBe(true);
      expect(isPlacaValid('abc-1234')).toBe(true);
      expect(isPlacaValid('xyz9999')).toBe(true);
      expect(isPlacaValid('MTO-0001')).toBe(true);
    });

    it('deve rejeitar placas fora dos padrões', () => {
      expect(isPlacaValid('')).toBe(false);
      expect(isPlacaValid('1234ABC')).toBe(false);
      expect(isPlacaValid('ABC123')).toBe(false);
      expect(isPlacaValid('ABC12345')).toBe(false);
      expect(isPlacaValid('ABCD123')).toBe(false);
      expect(isPlacaValid('AB1234')).toBe(false);
      expect(isPlacaValid('A1B2C3D')).toBe(false);
      expect(isPlacaValid('ABC-123A')).toBe(false);
      expect(isPlacaValid('1234-ABC')).toBe(false);
      expect(isPlacaValid('ABC--1234')).toBe(false);
    });
  });

  describe('placaValidator (FormControl)', () => {
    const validator = placaValidator();

    it('deve retornar null para campo vazio ou nulo (deixando obrigatoriedade para required)', () => {
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
      expect(validator(new FormControl('   '))).toBeNull();
    });

    it('deve retornar null para placas válidas no controle de formulário', () => {
      expect(validator(new FormControl('BRA2E19'))).toBeNull();
      expect(validator(new FormControl('ABC-1234'))).toBeNull();
      expect(validator(new FormControl('xyz1a23'))).toBeNull();
    });

    it('deve retornar erro para placas inválidas no controle de formulário', () => {
      const result = validator(new FormControl('PLACA_INVALIDA'));
      expect(result).not.toBeNull();
      expect(result?.['placa']).toBeDefined();
      expect(result?.['placa']?.message).toContain('Placa inválida');
    });
  });
});

