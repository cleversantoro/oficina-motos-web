import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    return this.http.get<T>(this.url(path), { params: this.toParams(params) });
  }

  listTable<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    return this.http.get<T>(this.url(path), { params: this.toParams(params) });
  }

  getById<T>(path: string, id: string | number) {
    return this.http.get<T>(`${this.url(path)}/${id}`);
  }

  create<T, B = unknown>(path: string, body: B) {
    return this.http.post<T>(this.url(path), body);
  }

  update<T, B = unknown>(path: string, id: string | number, body: B) {
    return this.http.put<T>(`${this.url(path)}/${id}`, body);
  }

  remove(path: string, id: string | number) {
    return this.http.delete(`${this.url(path)}/${id}`);
  }

  private url(path: string) {
    return `${this.baseUrl}${path}`;
  }

  private toParams(obj?: Record<string, string | number | boolean | undefined>) {
    if (!obj) return undefined;
    let params = new HttpParams();
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
