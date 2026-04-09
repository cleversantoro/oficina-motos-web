import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask';
import { ConfirmationService } from 'primeng/api';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 1. Rotas com suporte a Input Binding (pegar ID da URL direto como @Input)
    // e ViewTransitions (animações nativas entre telas)
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // 2. Cliente HTTP moderno (Fetch API) + interceptors
    // Ordem: authInterceptor (adiciona token) → errorInterceptor (trata erros)
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),

    // 3. Animações do Angular e PrimeNG
    provideAnimations(),

    // 4. Máscaras de input (ngx-mask)
    provideNgxMask(),

    // 5. Serviços do PrimeNG
    ConfirmationService,
  ],
};
