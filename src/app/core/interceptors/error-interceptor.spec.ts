import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
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

  it('expõe um interceptor funcional compatível com o Angular', () => {
    expect(typeof interceptor).toBe('function');
  });
});
