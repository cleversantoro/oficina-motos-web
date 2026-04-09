import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, map, timeout, retry } from 'rxjs/operators';
import { ViaCepResponse, Endereco } from '../models/endereco';

/**
 * Serviço para busca de CEP usando API ViaCEP
 * Documentação: https://viacep.com.br/
 */
@Injectable({
  providedIn: 'root',
})
export class CepService {
  private http = inject(HttpClient);
  private readonly VIACEP_API = 'https://viacep.com.br/ws';
  private readonly TIMEOUT_MS = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  /**
   * Busca endereço pelo CEP na API ViaCEP
   * @param cep CEP com ou sem máscara (00000-000 ou 00000000)
   * @returns Observable com dados do endereço ou erro
   */
  buscarCep(cep: string): Observable<Endereco> {
    const cepLimpo = this.limparCep(cep);

    // Validação básica
    if (!this.validarFormatoCep(cepLimpo)) {
      return throwError(() => new Error('CEP inválido. Deve conter 8 dígitos.'));
    }

    const url = `${this.VIACEP_API}/${cepLimpo}/json/`;

    return this.http.get<ViaCepResponse>(url).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_ATTEMPTS),
      map((response) => this.mapearParaEndereco(response)),
      catchError((error) => this.tratarErro(error))
    );
  }

  /**
   * Busca CEP de forma síncrona usando Promise (alternativa async/await)
   * @param cep CEP com ou sem máscara
   * @returns Promise com dados do endereço
   */
  async buscarCepAsync(cep: string): Promise<Endereco> {
    return this.buscarCep(cep).toPromise() as Promise<Endereco>;
  }

  /**
   * Busca múltiplos CEPs em paralelo
   * @param ceps Array de CEPs
   * @returns Observable com array de endereços
   */
  buscarMultiplosCeps(ceps: string[]): Observable<Endereco[]> {
    if (ceps.length === 0) {
      return of([]);
    }

    const requests = ceps.map((cep) => this.buscarCep(cep));
    return forkJoin(requests);
  }

  /**
   * Verifica se CEP existe (retorna true/false)
   * @param cep CEP a ser verificado
   * @returns Observable<boolean>
   */
  cepExiste(cep: string): Observable<boolean> {
    return this.buscarCep(cep).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Remove caracteres não numéricos do CEP
   * @param cep CEP com ou sem máscara
   * @returns CEP apenas com números
   */
  private limparCep(cep: string): string {
    return cep?.replace(/\D/g, '') || '';
  }

  /**
   * Valida se CEP tem formato correto (8 dígitos)
   * @param cep CEP sem máscara
   * @returns true se válido
   */
  private validarFormatoCep(cep: string): boolean {
    return /^\d{8}$/.test(cep);
  }

  /**
   * Mapeia resposta da API ViaCEP para modelo Endereco
   * @param response Resposta da API ViaCEP
   * @returns Objeto Endereco normalizado
   */
  private mapearParaEndereco(response: ViaCepResponse): Endereco {
    // ViaCEP retorna { erro: true } quando CEP não existe
    if (response.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      cep: response.cep.replace('-', ''),
      logradouro: response.logradouro,
      complemento: response.complemento,
      bairro: response.bairro,
      cidade: response.localidade,
      estado: this.obterNomeEstado(response.uf),
      uf: response.uf,
      ibge: response.ibge,
      ddd: response.ddd,
    };
  }

  /**
   * Obtém nome completo do estado pela sigla
   * @param uf Sigla do estado (ex: SP)
   * @returns Nome do estado (ex: São Paulo)
   */
  private obterNomeEstado(uf: string): string {
    const estados: Record<string, string> = {
      AC: 'Acre',
      AL: 'Alagoas',
      AP: 'Amapá',
      AM: 'Amazonas',
      BA: 'Bahia',
      CE: 'Ceará',
      DF: 'Distrito Federal',
      ES: 'Espírito Santo',
      GO: 'Goiás',
      MA: 'Maranhão',
      MT: 'Mato Grosso',
      MS: 'Mato Grosso do Sul',
      MG: 'Minas Gerais',
      PA: 'Pará',
      PB: 'Paraíba',
      PR: 'Paraná',
      PE: 'Pernambuco',
      PI: 'Piauí',
      RJ: 'Rio de Janeiro',
      RN: 'Rio Grande do Norte',
      RS: 'Rio Grande do Sul',
      RO: 'Rondônia',
      RR: 'Roraima',
      SC: 'Santa Catarina',
      SP: 'São Paulo',
      SE: 'Sergipe',
      TO: 'Tocantins',
    };

    return estados[uf] || uf;
  }

  /**
   * Trata erros da requisição
   * @param error Erro capturado
   * @returns Observable com erro tratado
   */
  private tratarErro(error: unknown): Observable<never> {
    let mensagemErro = 'Erro ao buscar CEP';

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          mensagemErro = 'Erro de conexão. Verifique sua internet.';
          break;
        case 400:
          mensagemErro = 'CEP inválido';
          break;
        case 404:
          mensagemErro = 'CEP não encontrado';
          break;
        case 429:
          mensagemErro = 'Muitas requisições. Tente novamente em alguns instantes.';
          break;
        case 500:
        case 502:
        case 503:
          mensagemErro = 'Serviço de CEP temporariamente indisponível';
          break;
        default:
          mensagemErro = `Erro ao buscar CEP: ${error.message}`;
      }
    } else if (error instanceof Error) {
      mensagemErro = error.message;
    }

    return throwError(() => new Error(mensagemErro));
  }

  /**
   * Formata CEP para exibição (00000-000)
   * @param cep CEP sem máscara
   * @returns CEP formatado
   */
  formatarCep(cep: string): string {
    const cepLimpo = this.limparCep(cep);
    if (cepLimpo.length === 8) {
      return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
    }
    return cep;
  }
}
