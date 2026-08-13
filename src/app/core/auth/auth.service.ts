import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { apiPaths } from '../services/api-paths';
import { CurrentUser, LoginRequest, LoginResponse } from './auth.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'oficina_token';
const REFRESH_TOKEN_KEY = 'oficina_refresh_token';
const USER_KEY  = 'oficina_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly _currentUser = signal<CurrentUser | null>(this._loadUser());

  /** Usuário autenticado atual (somente leitura). */
  readonly currentUser = this._currentUser.asReadonly();

  /** `true` enquanto o token ainda não estiver expirado. */
  readonly isAuthenticated = computed(() => {
    const user = this._currentUser();
    return !!user && new Date(user.expiresAt) > new Date();
  });

  /** Papel atual do usuário autenticado, se houver. */
  readonly currentRole = computed(() => this._currentUser()?.role ?? null);

  /** Permissões canônicas da sessão atual. */
  readonly permissions = computed(() => this._currentUser()?.permissions ?? []);

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this._url(apiPaths.auth.login), credentials).pipe(
      tap(response => {
        this._persistSession(response);
      })
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token não disponível');
    }

    return this.http.post<LoginResponse>(this._url(apiPaths.auth.refresh), { refreshToken }).pipe(
      tap(response => {
        this._persistSession(response);
      })
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(this._url(apiPaths.auth.logout), { refreshToken }).subscribe({
        error: () => undefined,
      });
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private _url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private _persistSession(response: LoginResponse): void {
    const user: CurrentUser = {
      email: response.email,
      name: response.name,
      role: response.role,
      permissions: response.permissions ?? [],
      expiresAt: new Date(response.expiresAt),
      refreshToken: response.refreshToken,
      refreshTokenExpiresAt: response.refreshTokenExpiresAt ? new Date(response.refreshTokenExpiresAt) : undefined,
    };

    localStorage.setItem(TOKEN_KEY, response.token);
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private _loadUser(): CurrentUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw) as CurrentUser;
      user.permissions = user.permissions ?? [];
      if (new Date(user.expiresAt) <= new Date()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}
