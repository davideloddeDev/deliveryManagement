import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiFeedbackService } from '../../core/api-feedback.service';
import { API_ENDPOINTS, POLLING_CONFIG } from '../../core/api-endpoints';

type StatoConsegna = 'In attesa' | 'In transito' | 'Consegnato' | 'Annullata';

interface Consegna {
  id: number;
  codice: string;
  cliente: string;
  indirizzo: string;
  targaMezzo: string;
  autista: string;
  stato: StatoConsegna;
  dataConsegna: string;
  importo: number;
}

type ConsegnaForm = Omit<Consegna, 'id'>;

const EMPTY_FORM: ConsegnaForm = {
  codice: '',
  cliente: '',
  indirizzo: '',
  targaMezzo: '',
  autista: '',
  stato: 'In attesa',
  dataConsegna: '',
  importo: 0
};

@Component({
  selector: 'app-consegne',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './consegne.html',
  styleUrl: './consegne.scss'
})
export class Consegne implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly feedback = inject(ApiFeedbackService);
  private readonly refreshMs = POLLING_CONFIG.consegneMs;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly consegne = signal<Consegna[]>([]);

  readonly statiConsegna: StatoConsegna[] = ['In attesa', 'In transito', 'Consegnato', 'Annullata'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly searchTerm = signal('');
  form: ConsegnaForm = { ...EMPTY_FORM };

  constructor() {
    void this.loadConsegne();
    this.refreshTimer = setInterval(() => {
      void this.loadConsegne();
    }, this.refreshMs);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  get consegneFiltrate(): Consegna[] {
    const termine = this.searchTerm().trim().toLowerCase();
    if (!termine) {
      return this.consegne();
    }
    return this.consegne().filter(
      (c) =>
        c.cliente.toLowerCase().includes(termine) ||
        c.targaMezzo.toLowerCase().includes(termine) ||
        c.autista.toLowerCase().includes(termine)
    );
  }

  get totale(): number {
    return this.consegne().length;
  }

  get inAttesa(): number {
    return this.consegne().filter((c) => c.stato === 'In attesa').length;
  }

  get inTransito(): number {
    return this.consegne().filter((c) => c.stato === 'In transito').length;
  }

  get consegnate(): number {
    return this.consegne().filter((c) => c.stato === 'Consegnato').length;
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
    this.showForm.set(true);
  }

  openEditForm(consegna: Consegna): void {
    this.editingId.set(consegna.id);
    const { id, ...rest } = consegna;
    this.form = { ...rest };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  async saveConsegna(): Promise<void> {
    if (!this.form.codice || !this.form.cliente) {
      return;
    }

    try {
      const payload = {
        codice: this.form.codice,
        cliente: this.form.cliente,
        indirizzo: this.form.indirizzo,
        targaMezzo: this.form.targaMezzo,
        autista: this.form.autista,
        stato: this.form.stato,
        dataConsegna: this.form.dataConsegna,
        importo: this.form.importo
      };

      const editingId = this.editingId();
      if (editingId !== null) {
        await firstValueFrom(
          this.http.patch(API_ENDPOINTS.consegne.byId(editingId), payload)
        );
        this.feedback.setSuccess('Consegna aggiornata con successo');
      } else {
        await firstValueFrom(this.http.post(API_ENDPOINTS.consegne.list, payload));
        this.feedback.setSuccess('Consegna creata con successo');
      }

      await this.loadConsegne();
      this.closeForm();
    } catch {
      // Mantiene il form aperto in caso di errore API.
    }
  }

  async deleteConsegna(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(API_ENDPOINTS.consegne.byId(id)));
      this.feedback.setSuccess('Consegna eliminata con successo');
      await this.loadConsegne();
    } catch {
      // Ignora errori runtime e mantiene lo stato corrente.
    }
  }

  private async loadConsegne(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: Array<Record<string, unknown>> }>(API_ENDPOINTS.consegne.list)
      );
      const payload = (response as { data?: Array<Record<string, unknown>> }).data ?? [];
      this.consegne.set(payload.map((item) => this.fromApi(item)));
    } catch {
      this.consegne.set([]);
    }
  }

  private fromApi(item: Record<string, unknown>): Consegna {
    const source = item as Record<string, unknown>;
    const id = Number(source['id'] ?? 0);
    const codice = String(source['codice'] ?? `#FD-${id}`);
    const mezzoId = source['mezzoId'] ? String(source['mezzoId']) : '';
    const autistaId = source['autistaId'] ? String(source['autistaId']) : '';

    return {
      id,
      codice,
      cliente: String(source['cliente'] ?? ''),
      indirizzo: String(source['indirizzo'] ?? ''),
      targaMezzo: String(source['targaMezzo'] ?? (mezzoId ? `Mezzo ${mezzoId}` : '')),
      autista: String(source['autista'] ?? (autistaId ? `Autista ${autistaId}` : '')),
      stato: this.normalizeStatus(String(source['stato'] ?? 'In attesa')),
      dataConsegna: String(source['dataConsegna'] ?? source['updatedAt'] ?? '-'),
      importo: Number(source['importo'] ?? 0)
    };
  }

  private normalizeStatus(stato: string): StatoConsegna {
    if (stato === 'In transito' || stato === 'Consegnato' || stato === 'Annullata') {
      return stato;
    }
    return 'In attesa';
  }
}
