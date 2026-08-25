import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly error = signal(false);

  onSubmit(): void {
    const success = this.authService.login(this.username, this.password);
    if (success) {
      this.error.set(false);
      this.router.navigateByUrl('/home');
    } else {
      this.error.set(true);
    }
  }
}
