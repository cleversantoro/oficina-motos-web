import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { apiPaths } from './api-paths';
import { DashboardKpisResponse } from '../models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiClientService) {}

  getKpis(periodo?: string): Observable<DashboardKpisResponse> {
    return this.api.list<DashboardKpisResponse>(
      apiPaths.dashboard.kpis,
      periodo ? { periodo } : undefined,
    );
  }
}
