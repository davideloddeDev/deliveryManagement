import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'mezzi',
        loadComponent: () => import('./pages/mezzi/mezzi').then((m) => m.Mezzi)
      },
      {
        path: 'collaboratori',
        loadComponent: () => import('./pages/collaboratori/collaboratori').then((m) => m.Collaboratori)
      },
      {
        path: 'consegne',
        loadComponent: () => import('./pages/consegne/consegne').then((m) => m.Consegne)
      },
      {
        path: 'pagamenti',
        loadComponent: () => import('./pages/pagamenti/pagamenti').then((m) => m.Pagamenti)
      },
      {
        path: 'entrate',
        loadComponent: () => import('./pages/entrate/entrate').then((m) => m.Entrate)
      },
      {
        path: 'impostazioni',
        loadComponent: () => import('./pages/impostazioni/impostazioni').then((m) => m.Impostazioni)
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
