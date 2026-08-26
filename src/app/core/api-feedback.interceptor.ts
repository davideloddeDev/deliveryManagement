import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, retry, throwError, timer } from 'rxjs';
import { API_BASE_URL } from './api-endpoints';
import { ApiFeedbackService } from './api-feedback.service';

export const apiFeedbackInterceptor: HttpInterceptorFn = (req, next) => {
  const feedback = inject(ApiFeedbackService);
  const isApiRequest = req.url.startsWith(API_BASE_URL);

  if (!isApiRequest) {
    return next(req);
  }

  feedback.begin();

  return next(req).pipe(
    retry({
      count: 1,
      delay: (error) => {
        if (canRetryRequest(req.method, error)) {
          return timer(450);
        }
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const backendMessage = typeof error.error?.error?.message === 'string' ? error.error.error.message : null;
      const fallback = error.status ? `Errore API (${error.status})` : 'Errore di rete';
      feedback.setError(backendMessage || fallback);
      return throwError(() => error);
    }),
    finalize(() => feedback.end())
  );
};

function canRetryRequest(method: string, error: unknown): boolean {
  if (method !== 'GET') {
    return false;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }

  const retriableStatuses = [0, 408, 429, 502, 503, 504];
  return retriableStatuses.includes(error.status);
}
