import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  private nextId = 6;

  readonly collaboratori = signal<Collaboratore[]>([
    { id: 1, nome: 'Marco', cognome: 'Rossi', ruolo: 'Autista', telefono: '333 1112233', email: 'marco.rossi@futuredelivery.it', stato: 'Attivo', dataAssunzione: '10/01/2023', scadenzaPatente: '15/10/2026' },
    { id: 2, nome: 'Giulia', cognome: 'Bianchi', ruolo: 'Magazziniere', telefono: '333 4445566', email: 'giulia.bianchi@futuredelivery.it', stato: 'Attivo', dataAssunzione: '05/03/2024', scadenzaPatente: '20/07/2026' },
    { id: 3, nome: 'Luca', cognome: 'Verdi', ruolo: 'Autista', telefono: '333 7778899', email: 'luca.verdi@futuredelivery.it', stato: 'In malattia', dataAssunzione: '22/09/2022', scadenzaPatente: '05/09/2026' },
    { id: 4, nome: 'Sara', cognome: 'Neri', ruolo: 'Responsabile logistica', telefono: '333 0001122', email: 'sara.neri@futuredelivery.it', stato: 'Attivo', dataAssunzione: '14/06/2021', scadenzaPatente: '01/12/2027' },
    { id: 5, nome: 'Davide', cognome: 'Gialli', ruolo: 'Autista', telefono: '333 3334455', email: 'davide.gialli@futuredelivery.it', stato: 'Cessato', dataAssunzione: '18/11/2020', scadenzaPatente: '20/07/2026' }
  ]);

  readonly ruoli = ['Autista', 'Magazziniere', 'Responsabile logistica', 'Amministrazione'];
  readonly statiCollaboratore: StatoCollaboratore[] = ['Attivo', 'In malattia', 'Cessato'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: CollaboratoreForm = { ...EMPTY_FORM };

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

  saveCollaboratore(): void {
    if (!this.form.nome || !this.form.cognome) {
      return;
    }

    const editingId = this.editingId();
    if (editingId !== null) {
      this.collaboratori.update((list) =>
        list.map((c) => (c.id === editingId ? { id: editingId, ...this.form } : c))
      );
    } else {
      this.collaboratori.update((list) => [...list, { id: this.nextId++, ...this.form }]);
    }

    this.closeForm();
  }

  deleteCollaboratore(id: number): void {
    this.collaboratori.update((list) => list.filter((c) => c.id !== id));
  }
}
