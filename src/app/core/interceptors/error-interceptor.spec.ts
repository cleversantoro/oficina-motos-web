import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { errorInterceptor } from './error-interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [AuthService],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('refreshes once and retries the original request on 401', () => {
    spyOn(authService, 'getRefreshToken').and.returnValue('refresh-token');
    spyOn(authService, 'refreshToken').and.returnValue(of({ token: 'new-token' } as any));
    spyOn(authService, 'getToken').and.returnValue('new-token');

    http.get('/protected').pipe(interceptor).subscribe();

    const first = httpMock.expectOne('/protected');
    first.flush(new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));

    const refreshReq = httpMock.expectOne('/api/v1/Auth/refresh');
    refreshReq.flush({ token: 'new-token' });

    const retried = httpMock.expectOne('/protected');
    retried.flush({ ok: true });

    expect(authService.refreshToken).toHaveBeenCalled();
  });
});
