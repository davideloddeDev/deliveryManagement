import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  private nextId = 6;

  readonly mezzi = signal<Mezzo[]>([
    { id: 1, targa: 'AB123CD', modello: 'Iveco Daily', tipo: 'Furgone', stato: 'Attivo', km: 84500, ultimaManutenzione: '12/06/2026', compagniaAssicurativa: 'Generali', numeroPolizza: 'GEN-2026-001', scadenzaAssicurazione: '15/10/2026', pagamentoAssicurazioneAutorizzato: false },
    { id: 2, targa: 'EF456GH', modello: 'Fiat Ducato', tipo: 'Furgone', stato: 'Attivo', km: 62300, ultimaManutenzione: '03/07/2026', compagniaAssicurativa: 'Allianz', numeroPolizza: 'ALZ-2025-118', scadenzaAssicurazione: '10/09/2026', pagamentoAssicurazioneAutorizzato: false },
    { id: 3, targa: 'IL789MN', modello: 'Mercedes Sprinter', tipo: 'Furgone', stato: 'In manutenzione', km: 121400, ultimaManutenzione: '20/08/2026', compagniaAssicurativa: 'Unipol', numeroPolizza: 'UNI-2026-054', scadenzaAssicurazione: '01/12/2026', pagamentoAssicurazioneAutorizzato: false },
    { id: 4, targa: 'OP321QR', modello: 'Piaggio Porter', tipo: 'Mezzo leggero', stato: 'Attivo', km: 45900, ultimaManutenzione: '28/05/2026', compagniaAssicurativa: 'Generali', numeroPolizza: 'GEN-2025-233', scadenzaAssicurazione: '05/09/2026', pagamentoAssicurazioneAutorizzato: false },
    { id: 5, targa: 'ST654UV', modello: 'Renault Master', tipo: 'Furgone', stato: 'Fuori servizio', km: 158700, ultimaManutenzione: '02/03/2026', compagniaAssicurativa: 'Allianz', numeroPolizza: 'ALZ-2024-077', scadenzaAssicurazione: '20/07/2026', pagamentoAssicurazioneAutorizzato: false }
  ]);

  readonly tipiMezzo = ['Furgone', 'Mezzo leggero', 'Camion', 'Moto'];
  readonly statiMezzo: StatoMezzo[] = ['Attivo', 'In manutenzione', 'Fuori servizio'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: MezzoForm = { ...EMPTY_FORM };

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

  autorizzaPagamentoAssicurazione(mezzo: Mezzo): void {
    this.mezzi.update((list) =>
      list.map((m) => (m.id === mezzo.id ? { ...m, pagamentoAssicurazioneAutorizzato: true } : m))
    );
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

  saveMezzo(): void {
    if (!this.form.targa || !this.form.modello) {
      return;
    }

    const editingId = this.editingId();
    if (editingId !== null) {
      this.mezzi.update((list) =>
        list.map((m) => (m.id === editingId ? { id: editingId, ...this.form } : m))
      );
    } else {
      this.mezzi.update((list) => [...list, { id: this.nextId++, ...this.form }]);
    }

    this.closeForm();
  }

  deleteMezzo(id: number): void {
    this.mezzi.update((list) => list.filter((m) => m.id !== id));
  }
}
