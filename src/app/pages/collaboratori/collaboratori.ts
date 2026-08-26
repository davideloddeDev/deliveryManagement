import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../../core/api-endpoints';

type StatoCollaboratore = 'Attivo' | 'In malattia' | 'Cessato';

interface Collaboratore {
  id: number;
  nome: string;
  cognome: string;
  ruolo: string;
  telefono: string;
  email: string;
  stato: StatoCollaboratore;
  dataAssunzione: string;
  scadenzaPatente: string;
}

type CollaboratoreForm = Omit<Collaboratore, 'id'>;

const EMPTY_FORM: CollaboratoreForm = {
  nome: '',
  cognome: '',
  ruolo: 'Autista',
  telefono: '',
  email: '',
  stato: 'Attivo',
  dataAssunzione: '',
  scadenzaPatente: ''
};

@Component({
  selector: 'app-collaboratori',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './collaboratori.html',
  styleUrl: './collaboratori.scss'
})
export class Collaboratori {
  private readonly http = inject(HttpClient);

  readonly collaboratori = signal<Collaboratore[]>([]);

  readonly ruoli = ['Autista', 'Magazziniere', 'Responsabile logistica', 'Amministrazione'];
  readonly statiCollaboratore: StatoCollaboratore[] = ['Attivo', 'In malattia', 'Cessato'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: CollaboratoreForm = { ...EMPTY_FORM };

  constructor() {
    void this.loadCollaboratori();
  }

  get totale(): number {
    return this.collaboratori().length;
  }

  get attivi(): number {
    return this.collaboratori().filter((c) => c.stato === 'Attivo').length;
  }

  get inMalattia(): number {
    return this.collaboratori().filter((c) => c.stato === 'In malattia').length;
  }

  get cessati(): number {
    return this.collaboratori().filter((c) => c.stato === 'Cessato').length;
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
    this.showForm.set(true);
  }

  openEditForm(collaboratore: Collaboratore): void {
    this.editingId.set(collaboratore.id);
    const { id, ...rest } = collaboratore;
    this.form = { ...rest };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  async saveCollaboratore(): Promise<void> {
    if (!this.form.nome || !this.form.cognome) {
      return;
    }

    try {
      const payload = {
        nome: this.form.nome,
        cognome: this.form.cognome,
        ruolo: this.form.ruolo,
        telefono: this.form.telefono,
        email: this.form.email,
        stato: this.form.stato,
        dataAssunzione: this.form.dataAssunzione,
        scadenzaPatente: this.form.scadenzaPatente
      };

      const editingId = this.editingId();
      if (editingId !== null) {
        await firstValueFrom(this.http.patch(API_ENDPOINTS.collaboratori.byId(editingId), payload));
      } else {
        await firstValueFrom(this.http.post(API_ENDPOINTS.collaboratori.list, payload));
      }

      await this.loadCollaboratori();
      this.closeForm();
    } catch {
      // Mantiene il form aperto in caso di errore API.
    }
  }

  async deleteCollaboratore(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(API_ENDPOINTS.collaboratori.byId(id)));
      await this.loadCollaboratori();
    } catch {
      // Ignora errori runtime e mantiene lo stato corrente.
    }
  }

  private async loadCollaboratori(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: Array<Record<string, unknown>> }>(API_ENDPOINTS.collaboratori.list)
      );
      const payload = (response as { data?: Array<Record<string, unknown>> }).data ?? [];
      this.collaboratori.set(payload.map((item) => {
        const source = item as Record<string, unknown>;
        return {
          id: Number(source['id'] ?? 0),
          nome: String(source['nome'] ?? ''),
          cognome: String(source['cognome'] ?? ''),
          ruolo: String(source['ruolo'] ?? 'Autista'),
          telefono: String(source['telefono'] ?? ''),
          email: String(source['email'] ?? ''),
          stato: this.normalizeStato(String(source['stato'] ?? 'Attivo')),
          dataAssunzione: String(source['dataAssunzione'] ?? ''),
          scadenzaPatente: String(source['scadenzaPatente'] ?? '')
        };
      }));
    } catch {
      this.collaboratori.set([]);
    }
  }

  private normalizeStato(value: string): StatoCollaboratore {
    if (value === 'In malattia' || value === 'Cessato') {
      return value;
    }
    return 'Attivo';
  }
}
