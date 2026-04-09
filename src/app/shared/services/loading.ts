import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Loading {
  private loadingCountSignal = signal(0);

  // Signal público readonly que indica se está carregando
  readonly isLoading = computed(() => this.loadingCountSignal() > 0);

  /**
   * Inicia o loading
   * Retorna uma função para finalizar este loading específico
   */
  show(): () => void {
    this.loadingCountSignal.update(count => count + 1);

    // Retorna função para finalizar
    let finished = false;
    return () => {
      if (!finished) {
        finished = true;
        this.hide();
      }
    };
  }

  /**
   * Finaliza um loading
   */
  private hide(): void {
    this.loadingCountSignal.update(count => Math.max(0, count - 1));
  }

  /**
   * Força a finalização de todos os loadings
   * Use com cuidado!
   */
  forceHideAll(): void {
    this.loadingCountSignal.set(0);
  }
}
