import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../../core/api-endpoints';

type StatoMezzo = 'Attivo' | 'In manutenzione' | 'Fuori servizio';
type StatoAssicurazione = 'Valida' | 'In scadenza' | 'Scaduta';

interface Mezzo {
  id: number;
  targa: string;
  modello: string;
  tipo: string;
  stato: StatoMezzo;
  km: number;
  ultimaManutenzione: string;
  compagniaAssicurativa: string;
  numeroPolizza: string;
  scadenzaAssicurazione: string;
  pagamentoAssicurazioneAutorizzato: boolean;
}

type MezzoForm = Omit<Mezzo, 'id'>;

const EMPTY_FORM: MezzoForm = {
  targa: '',
  modello: '',
  tipo: 'Furgone',
  stato: 'Attivo',
  km: 0,
  ultimaManutenzione: '',
  compagniaAssicurativa: '',
  numeroPolizza: '',
  scadenzaAssicurazione: '',
  pagamentoAssicurazioneAutorizzato: false
};

@Component({
  selector: 'app-mezzi',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './mezzi.html',
  styleUrl: './mezzi.scss'
})
export class Mezzi {
  private readonly http = inject(HttpClient);

  readonly mezzi = signal<Mezzo[]>([]);

  readonly tipiMezzo = ['Furgone', 'Mezzo leggero', 'Camion', 'Moto'];
  readonly statiMezzo: StatoMezzo[] = ['Attivo', 'In manutenzione', 'Fuori servizio'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: MezzoForm = { ...EMPTY_FORM };

  constructor() {
    void this.loadMezzi();
  }

  get totale(): number {
    return this.mezzi().length;
  }

  get attivi(): number {
    return this.mezzi().filter((m) => m.stato === 'Attivo').length;
  }

  get inManutenzione(): number {
    return this.mezzi().filter((m) => m.stato === 'In manutenzione').length;
  }

  get fuoriServizio(): number {
    return this.mezzi().filter((m) => m.stato === 'Fuori servizio').length;
  }

  get assicurazioniInScadenza(): number {
    return this.mezzi().filter((m) => this.statoAssicurazione(m.scadenzaAssicurazione) !== 'Valida').length;
  }

  statoAssicurazione(scadenza: string): StatoAssicurazione {
    const data = this.parseData(scadenza);
    if (!data) {
      return 'Scaduta';
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const giorniMancanti = Math.floor((data.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24));

    if (giorniMancanti < 0) {
      return 'Scaduta';
    }
    if (giorniMancanti <= 30) {
      return 'In scadenza';
    }
    return 'Valida';
  }

  private parseData(data: string): Date | null {
    const parti = data.split('/');
    if (parti.length !== 3) {
      return null;
    }
    const [giorno, mese, anno] = parti.map(Number);
    if (!giorno || !mese || !anno) {
      return null;
    }
    return new Date(anno, mese - 1, giorno);
  }

  async autorizzaPagamentoAssicurazione(mezzo: Mezzo): Promise<void> {
    try {
      await firstValueFrom(this.http.post(API_ENDPOINTS.mezzi.authorizeInsurancePayment(mezzo.id), {}));
      await this.loadMezzi();
    } catch {
      // Ignora errori runtime e mantiene lo stato corrente.
    }
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
    this.showForm.set(true);
  }

  openEditForm(mezzo: Mezzo): void {
    this.editingId.set(mezzo.id);
    const { id, ...rest } = mezzo;
    this.form = { ...rest };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  async saveMezzo(): Promise<void> {
    if (!this.form.targa || !this.form.modello) {
      return;
    }

    try {
      const payload = {
        targa: this.form.targa,
        modello: this.form.modello,
        tipo: this.form.tipo,
        stato: this.form.stato,
        km: this.form.km,
        ultimaManutenzione: this.form.ultimaManutenzione,
        compagniaAssicurativa: this.form.compagniaAssicurativa,
        numeroPolizza: this.form.numeroPolizza,
        scadenzaAssicurazione: this.form.scadenzaAssicurazione,
        pagamentoAssicurazioneAutorizzato: this.form.pagamentoAssicurazioneAutorizzato
      };

      const editingId = this.editingId();
      if (editingId !== null) {
        await firstValueFrom(this.http.patch(API_ENDPOINTS.mezzi.byId(editingId), payload));
      } else {
        await firstValueFrom(this.http.post(API_ENDPOINTS.mezzi.list, payload));
      }

      await this.loadMezzi();
      this.closeForm();
    } catch {
      // Mantiene il form aperto in caso di errore API.
    }
  }

  async deleteMezzo(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(API_ENDPOINTS.mezzi.byId(id)));
      await this.loadMezzi();
    } catch {
      // Ignora errori runtime e mantiene lo stato corrente.
    }
  }

  private async loadMezzi(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: Array<Record<string, unknown>> }>(API_ENDPOINTS.mezzi.list)
      );

      const payload = (response as { data?: Array<Record<string, unknown>> }).data ?? [];
      this.mezzi.set(payload.map((item) => {
        const source = item as Record<string, unknown>;
        return {
          id: Number(source['id'] ?? 0),
          targa: String(source['targa'] ?? ''),
          modello: String(source['modello'] ?? ''),
          tipo: String(source['tipo'] ?? 'Furgone'),
          stato: this.normalizeStato(String(source['stato'] ?? 'Attivo')),
          km: Number(source['km'] ?? 0),
          ultimaManutenzione: String(source['ultimaManutenzione'] ?? ''),
          compagniaAssicurativa: String(source['compagniaAssicurativa'] ?? ''),
          numeroPolizza: String(source['numeroPolizza'] ?? ''),
          scadenzaAssicurazione: String(source['scadenzaAssicurazione'] ?? ''),
          pagamentoAssicurazioneAutorizzato: Boolean(source['pagamentoAssicurazioneAutorizzato'])
        };
      }));
    } catch {
      this.mezzi.set([]);
    }
  }

  private normalizeStato(value: string): StatoMezzo {
    if (value === 'In manutenzione' || value === 'Fuori servizio') {
      return value;
    }
    return 'Attivo';
  }
}
