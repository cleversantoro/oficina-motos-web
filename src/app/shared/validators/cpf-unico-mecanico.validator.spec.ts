import { FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import {
  cpfUnicoMecanicoAsyncValidator,
  cpfUnicoMecanicoValidator,
  formatCpf,
} from './cpf-unico-mecanico.validator';

describe('cpfUnicoMecanicoValidator', () => {
  // CPFs válidos conhecidos para testes
  const cpfValido1 = '52998224725';
  const cpfValido2 = '12345678909';

  const mecanicosCadastradosMock = [
    { id: 1, documentoPrincipal: '529.982.247-25', nome: 'Carlos Mecânico' },
    { id: 2, documentoPrincipal: '98765432100', nome: 'João Técnico' },
  ];

  describe('cpfUnicoMecanicoValidator (Síncrono)', () => {
    it('deve retornar null para valor vazio ou nulo', () => {
      const validator = cpfUnicoMecanicoValidator(mecanicosCadastradosMock);
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });

    it('deve retornar erro de formato quando CPF não possuir 11 dígitos', () => {
      const validator = cpfUnicoMecanicoValidator(mecanicosCadastradosMock);
      const res = validator(new FormControl('123456'));
      expect(res).toEqual({
        cpf: { message: 'CPF deve conter 11 dígitos' },
      });
    });

    it('deve retornar erro de algoritmo quando CPF for matematicamente inválido', () => {
      const validator = cpfUnicoMecanicoValidator(mecanicosCadastradosMock);
      const res = validator(new FormControl('11111111111'));
      expect(res).toEqual({
        cpf: { message: 'CPF inválido' },
      });
    });

    it('deve retornar erro de duplicidade quando CPF já pertencer a outro mecânico', () => {
      const validator = cpfUnicoMecanicoValidator(mecanicosCadastradosMock);
      const res = validator(new FormControl(cpfValido1));
      expect(res).toEqual({
        cpfDuplicado: {
          message: 'Este CPF já está cadastrado para outro mecânico.',
        },
      });
    });

    it('deve aceitar função geradora (Signal / getter) e detectar duplicidade dinamicamente', () => {
      let lista = [...mecanicosCadastradosMock];
      const validator = cpfUnicoMecanicoValidator(() => lista);

      expect(validator(new FormControl(cpfValido1))).toEqual({
        cpfDuplicado: {
          message: 'Este CPF já está cadastrado para outro mecânico.',
        },
      });

      // Se a lista mudar
      lista = [];
      expect(validator(new FormControl(cpfValido1))).toBeNull();
    });

    it('deve retornar null quando CPF for válido e não estiver na lista', () => {
      const validator = cpfUnicoMecanicoValidator(mecanicosCadastradosMock);
      // cpfValido2 não está no mock
      const res = validator(new FormControl(cpfValido2));
      expect(res).toBeNull();
    });

    it('deve ignorar duplicidade caso seja o próprio mecânico sendo editado', () => {
      const validator = cpfUnicoMecanicoValidator(mecanicosCadastradosMock, 1);
      const res = validator(new FormControl(cpfValido1));
      expect(res).toBeNull();
    });
  });

  describe('cpfUnicoMecanicoAsyncValidator (Assíncrono)', () => {
    it('deve retornar null para valor vazio de forma assíncrona', async () => {
      const mockService = { getAll: () => of(mecanicosCadastradosMock) };
      const validator = cpfUnicoMecanicoAsyncValidator(mockService);

      const res = await new Promise((resolve) => {
        (validator(new FormControl('')) as any).subscribe(resolve);
      });
      expect(res).toBeNull();
    });

    it('deve detectar duplicidade assíncrona com base na resposta da API', async () => {
      const mockService = { getAll: () => of(mecanicosCadastradosMock) };
      const validator = cpfUnicoMecanicoAsyncValidator(mockService);

      const res = await new Promise((resolve) => {
        (validator(new FormControl(cpfValido1)) as any).subscribe(resolve);
      });
      expect(res).toEqual({
        cpfDuplicado: {
          message: 'Este CPF já está cadastrado para outro mecânico.',
        },
      });
    });

    it('deve retornar null quando CPF não estiver duplicado na API', async () => {
      const mockService = { getAll: () => of(mecanicosCadastradosMock) };
      const validator = cpfUnicoMecanicoAsyncValidator(mockService);

      const res = await new Promise((resolve) => {
        (validator(new FormControl(cpfValido2)) as any).subscribe(resolve);
      });
      expect(res).toBeNull();
    });

    it('deve tratar falha da API graciosamente retornando null', async () => {
      const mockService = {
        getAll: () => throwError(() => new Error('Erro de conexão')),
      };
      const validator = cpfUnicoMecanicoAsyncValidator(mockService);

      const res = await new Promise((resolve) => {
        (validator(new FormControl(cpfValido2)) as any).subscribe(resolve);
      });
      expect(res).toBeNull();
    });
  });

  describe('formatCpf helper', () => {
    it('deve formatar CPF de 11 dígitos com pontuação', () => {
      expect(formatCpf('52998224725')).toBe('529.982.247-25');
    });

    it('deve retornar o valor original se não possuir 11 dígitos', () => {
      expect(formatCpf('123')).toBe('123');
      expect(formatCpf('')).toBe('');
    });
  });
});

