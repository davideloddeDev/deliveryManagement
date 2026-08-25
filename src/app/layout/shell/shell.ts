import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(true);

  readonly menuItems = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: 'mezzi', label: 'Mezzi', icon: 'mezzi' },
    { path: 'collaboratori', label: 'Collaboratori', icon: 'collaboratori' },
    { path: 'consegne', label: 'Consegne', icon: 'consegne' },
    { path: 'pagamenti', label: 'Pagamenti', icon: 'pagamenti' },
    { path: 'entrate', label: 'Entrate', icon: 'entrate' },
    { path: 'impostazioni', label: 'Impostazioni', icon: 'impostazioni' }
  ];

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
