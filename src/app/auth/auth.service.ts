import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../core/api-endpoints';

const STORAGE_KEY = 'fd_auth_logged_in';
const STORAGE_TOKEN_KEY = 'fd_auth_access_token';
const STORAGE_USER_KEY = 'fd_auth_user';

interface UserProfile {
  nome: string;
  cognome: string;
  email?: string;
  ruolo?: string;
}

interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly loggedIn = signal<boolean>(localStorage.getItem(STORAGE_KEY) === 'true');
  private readonly user = signal<UserProfile>(this.restoreUser());

  readonly isLoggedIn = this.loggedIn.asReadonly();
  readonly currentUser = this.user.asReadonly();

  constructor() {
    if (this.getAccessToken()) {
      void this.restoreSession();
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    if (!email || !password) {
      return false;
    }

    try {
      const response = await firstValueFrom(this.http.post<LoginResponse>(API_ENDPOINTS.auth.login, { email, password }));
      this.loggedIn.set(true);
      this.user.set(response.user);
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(STORAGE_TOKEN_KEY, response.accessToken);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user));
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  async register(input: {
    nome: string;
    cognome: string;
    email: string;
    password: string;
    licenseKey: string;
    ruolo?: string;
  }): Promise<boolean> {
    if (!input.email || !input.password || !input.licenseKey) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(API_ENDPOINTS.auth.register, {
          nome: input.nome,
          cognome: input.cognome,
          email: input.email,
          password: input.password,
          licenseKey: input.licenseKey,
          ruolo: input.ruolo || 'Operatore'
        })
      );
      this.loggedIn.set(true);
      this.user.set(response.user);
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(STORAGE_TOKEN_KEY, response.accessToken);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user));
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  logout(): void {
    const token = this.getAccessToken();
    if (token) {
      void firstValueFrom(
        this.http.post(
          API_ENDPOINTS.auth.logout,
          {},
          { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
        )
      ).catch(() => undefined);
    }
    this.clearSession();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  private async restoreSession(): Promise<void> {
    const token = this.getAccessToken();
    if (!token) {
      this.clearSession();
      return;
    }

    try {
      const profile = await firstValueFrom(
        this.http.get<UserProfile>(API_ENDPOINTS.auth.me, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        })
      );
      this.loggedIn.set(true);
      this.user.set(profile);
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.loggedIn.set(false);
    this.user.set(this.restoreUser(true));
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  }

  private restoreUser(forceDefault = false): UserProfile {
    if (!forceDefault) {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      if (raw) {
        try {
          return JSON.parse(raw) as UserProfile;
        } catch {
          // ignore parse errors and use fallback profile
        }
      }
    }
    return { nome: 'Utente', cognome: '' };
  }
}
