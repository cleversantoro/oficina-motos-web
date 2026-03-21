import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CurrentUser, LoginRequest, LoginResponse } from './auth.model';

const TOKEN_KEY = 'oficina_token';
const USER_KEY  = 'oficina_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<CurrentUser | null>(this._loadUser());

  /** Usuário autenticado atual (somente leitura). */
  readonly currentUser = this._currentUser.asReadonly();

  /** `true` enquanto o token ainda não estiver expirado. */
  readonly isAuthenticated = computed(() => {
    const user = this._currentUser();
    return !!user && new Date(user.expiresAt) > new Date();
  });

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/v1/Auth/login`, credentials)
      .pipe(
        tap(response => {
          const user: CurrentUser = {
            email: response.email,
            name: response.name,
            role: response.role,
            expiresAt: new Date(response.expiresAt),
          };
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this._currentUser.set(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private _loadUser(): CurrentUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw) as CurrentUser;
      if (new Date(user.expiresAt) <= new Date()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}
