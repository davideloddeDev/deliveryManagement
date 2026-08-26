import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../../core/api-endpoints';

type TipoEntrata = 'Fatture' | 'Vendite' | 'Rimborsi';
type StatoEntrata = 'Incassato' | 'In attesa';

interface Entrata {
  id: number;
  tipo: TipoEntrata;
  cliente: string;
  descrizione: string;
  importo: number;
  stato: StatoEntrata;
  data: string;
}

type EntrataForm = Omit<Entrata, 'id'>;

@Component({
  selector: 'app-entrate',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './entrate.html',
  styleUrl: './entrate.scss'
})
export class Entrate {
  private readonly http = inject(HttpClient);

  readonly tabs: TipoEntrata[] = ['Fatture', 'Vendite', 'Rimborsi'];
  readonly activeTab = signal<TipoEntrata>('Fatture');

  readonly entrate = signal<Entrata[]>([]);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: EntrataForm = this.emptyForm();

  constructor() {
    void this.loadEntrate();
  }

  get entrateFiltrate(): Entrata[] {
    return this.entrate().filter((e) => e.tipo === this.activeTab());
  }

  get totaleImporto(): number {
    return this.entrateFiltrate.reduce((sum, e) => sum + e.importo, 0);
  }

  get incassate(): number {
    return this.entrateFiltrate.filter((e) => e.stato === 'Incassato').length;
  }

  get inAttesa(): number {
    return this.entrateFiltrate.filter((e) => e.stato === 'In attesa').length;
  }

  get importoInAttesa(): number {
    return this.entrateFiltrate
      .filter((e) => e.stato === 'In attesa')
      .reduce((sum, e) => sum + e.importo, 0);
  }

  selectTab(tab: TipoEntrata): void {
    this.activeTab.set(tab);
  }

  private emptyForm(): EntrataForm {
    return {
      tipo: this.activeTab(),
      cliente: '',
      descrizione: '',
      importo: 0,
      stato: 'In attesa',
      data: ''
    };
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  openEditForm(entrata: Entrata): void {
    this.editingId.set(entrata.id);
    const { id, ...rest } = entrata;
    this.form = { ...rest };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  async saveEntrata(): Promise<void> {
    if (!this.form.cliente || !this.form.descrizione) {
      return;
    }

    try {
      const payload = {
        tipo: this.form.tipo,
        cliente: this.form.cliente,
        descrizione: this.form.descrizione,
        importo: this.form.importo,
        stato: this.form.stato,
        data: this.form.data,
        metodo: 'Bonifico',
        riferimento: this.form.descrizione
      };

      const editingId = this.editingId();
      if (editingId !== null) {
        await firstValueFrom(this.http.patch(API_ENDPOINTS.entrate.byId(editingId), payload));
      } else {
        await firstValueFrom(this.http.post(API_ENDPOINTS.entrate.list, payload));
      }

      await this.loadEntrate();
      this.closeForm();
    } catch {
      // Mantiene il form aperto in caso di errore API.
    }
  }

  async segnaComeIncassato(entrata: Entrata): Promise<void> {
    try {
      await firstValueFrom(this.http.patch(API_ENDPOINTS.entrate.markReceived(entrata.id), {}));
      await this.loadEntrate();
    } catch {
      // Ignora errori runtime e mantiene lo stato corrente.
    }
  }

  async deleteEntrata(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(API_ENDPOINTS.entrate.byId(id)));
      await this.loadEntrate();
    } catch {
      // Ignora errori runtime e mantiene lo stato corrente.
    }
  }

  private async loadEntrate(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: Array<Record<string, unknown>> }>(API_ENDPOINTS.entrate.list)
      );
      const payload = (response as { data?: Array<Record<string, unknown>> }).data ?? [];
      this.entrate.set(payload.map((item) => {
        const source = item as Record<string, unknown>;
        return {
          id: Number(source['id'] ?? 0),
          tipo: this.normalizeTipo(String(source['tipo'] ?? 'Fatture')),
          cliente: String(source['cliente'] ?? ''),
          descrizione: String(source['descrizione'] ?? source['riferimento'] ?? ''),
          importo: Number(source['importo'] ?? 0),
          stato: this.normalizeStato(String(source['stato'] ?? 'In attesa')),
          data: String(source['data'] ?? source['dataIncasso'] ?? '-')
        };
      }));
    } catch {
      this.entrate.set([]);
    }
  }

  private normalizeTipo(value: string): TipoEntrata {
    if (value === 'Vendite' || value === 'Rimborsi') {
      return value;
    }
    return 'Fatture';
  }

  private normalizeStato(value: string): StatoEntrata {
    if (value === 'Incassato') {
      return value;
    }
    return 'In attesa';
  }
}
