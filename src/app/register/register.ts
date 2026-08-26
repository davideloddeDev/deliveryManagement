import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  nome = '';
  cognome = '';
  email = '';
  password = '';
  licenseKey = '';
  showPassword = false;
  readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (!this.nome || !this.cognome || !this.email || !this.password || !this.licenseKey) {
      this.error.set('Completa tutti i campi richiesti.');
      return;
    }

    const success = await this.authService.register({
      nome: this.nome,
      cognome: this.cognome,
      email: this.email,
      password: this.password,
      licenseKey: this.licenseKey,
      ruolo: 'Operatore'
    });

    if (success) {
      this.error.set(null);
      this.router.navigateByUrl('/home');
    } else {
      this.error.set('Registrazione fallita. Controlla email, password e chiave licenza.');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
