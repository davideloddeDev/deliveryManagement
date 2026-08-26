import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiFeedbackService {
  private readonly pendingCount = signal(0);
  private readonly errorMessage = signal<string | null>(null);
  private readonly successMessage = signal<string | null>(null);
  private successTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly isLoading = this.pendingCount.asReadonly();
  readonly lastError = this.errorMessage.asReadonly();
  readonly lastSuccess = this.successMessage.asReadonly();

  begin(): void {
    this.pendingCount.update((value) => value + 1);
  }

  end(): void {
    this.pendingCount.update((value) => Math.max(0, value - 1));
  }

  setError(message: string): void {
    this.errorMessage.set(message);
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  setSuccess(message: string, autoHideMs = 2400): void {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
      this.successTimeout = null;
    }

    this.successMessage.set(message);

    if (autoHideMs > 0) {
      this.successTimeout = setTimeout(() => {
        this.clearSuccess();
      }, autoHideMs);
    }
  }

  clearSuccess(): void {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
      this.successTimeout = null;
    }
    this.successMessage.set(null);
  }
}
