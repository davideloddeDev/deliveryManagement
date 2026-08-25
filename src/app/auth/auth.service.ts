import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'fd_auth_logged_in';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loggedIn = signal<boolean>(localStorage.getItem(STORAGE_KEY) === 'true');

  readonly isLoggedIn = this.loggedIn.asReadonly();

  // Login fake: accetta qualsiasi credenziale non vuota
  login(username: string, password: string): boolean {
    if (!username || !password) {
      return false;
    }
    this.loggedIn.set(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    return true;
  }

  logout(): void {
    this.loggedIn.set(false);
    localStorage.removeItem(STORAGE_KEY);
  }
}
