import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 1. Rotas com suporte a Input Binding (pegar ID da URL direto como @Input)
    // e ViewTransitions (animações nativas entre telas)
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // 2. Cliente HTTP moderno (Fetch API) + interceptor JWT
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
  ]
};
