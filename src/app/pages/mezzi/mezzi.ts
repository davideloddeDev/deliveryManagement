import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FakeDataService, Mezzo } from '../../core/fake-data.service';

type StatoMezzo = 'Attivo' | 'In manutenzione' | 'Inattivo' | 'Fuori servizio';
type StatoAssicurazione = 'Valida' | 'In scadenza' | 'Scaduta';

type MezzoForm = Omit<Mezzo, 'id'>;

const EMPTY_FORM: MezzoForm = {
  targa: '',
  marca: '',
  modello: '',
  anno: new Date().getFullYear(),
  tipo: 'Furgone',
  stato: 'Attivo',
  kilometraggio: 0,
  km: 0,
  ultimaManutenzione: '',
  compagniaAssicurativa: '',
  numeroPolizza: '',
  pagamentoAssicurazioneAutorizzato: false,
  scadenzaAssicurazione: ''
};

@Component({
  selector: 'app-mezzi',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './mezzi.html',
  styleUrl: './mezzi.scss'
})
export class Mezzi {
  private readonly fakeData = inject(FakeDataService);
  private nextId = 100;

  readonly mezzi = signal<Mezzo[]>([]);

  readonly tipiMezzo = ['Furgone', 'Mezzo leggero', 'Camion', 'Moto'];
  readonly statiMezzo: StatoMezzo[] = ['Attivo', 'In manutenzione', 'Inattivo'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: MezzoForm = { ...EMPTY_FORM };

  constructor() {
    this.loadMezzi();
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

  get inattivi(): number {
    return this.mezzi().filter((m) => m.stato === 'Inattivo').length;
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
    const parti = data.split('-');
    if (parti.length !== 3) {
      return null;
    }
    const [anno, mese, giorno] = parti.map(Number);
    if (!giorno || !mese || !anno) {
      return null;
    }
    return new Date(anno, mese - 1, giorno);
  }

  autorizzaPagamentoAssicurazione(mezzo: Mezzo): void {
    const current = this.mezzi();
    const index = current.findIndex((m) => m.id === mezzo.id);
    if (index !== -1) {
      current[index] = { ...current[index], pagamentoAssicurazioneAutorizzato: true };
      this.mezzi.set([...current]);
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

  saveMezzo(): void {
    if (!this.form.targa || !this.form.modello) {
      return;
    }

    const editingId = this.editingId();
    const current = this.mezzi();

    if (editingId !== null) {
      const index = current.findIndex((m) => m.id === editingId);
      if (index !== -1) {
        current[index] = { ...current[index], ...this.form };
        this.mezzi.set([...current]);
      }
    } else {
      const newMezzo: Mezzo = {
        id: this.nextId++,
        ...this.form
      };
      this.mezzi.set([...current, newMezzo]);
    }

    this.closeForm();
  }

  deleteMezzo(id: number): void {
    const current = this.mezzi();
    this.mezzi.set(current.filter((m) => m.id !== id));
  }

  private loadMezzi(): void {
    this.mezzi.set(this.fakeData.getMezzi());
  }
}
