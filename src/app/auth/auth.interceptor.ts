import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../core/api-endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const isApiRequest = req.url.startsWith(API_BASE_URL);
  const isPublicAuthCall = req.url.endsWith('/auth/login') || req.url.endsWith('/auth/register');

  if (!token || !isApiRequest || isPublicAuthCall) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};
