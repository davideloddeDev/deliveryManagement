import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FakeDataService, Collaboratore } from '../../core/fake-data.service';

type StatoCollaboratore = 'Attivo' | 'In malattia' | 'Cessato';
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
  private readonly fakeData = inject(FakeDataService);
  private nextId = 100;

  readonly collaboratori = signal<Collaboratore[]>([]);

  readonly ruoli = ['Autista', 'Magazziniere', 'Responsabile logistica', 'Amministrazione'];
  readonly statiCollaboratore: StatoCollaboratore[] = ['Attivo', 'In malattia', 'Cessato'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: CollaboratoreForm = { ...EMPTY_FORM };

  constructor() {
    this.loadCollaboratori();
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

  saveCollaboratore(): void {
    if (!this.form.nome || !this.form.cognome) {
      return;
    }

    const editingId = this.editingId();
    const current = this.collaboratori();

    if (editingId !== null) {
      const index = current.findIndex((c) => c.id === editingId);
      if (index !== -1) {
        current[index] = { ...current[index], ...this.form };
        this.collaboratori.set([...current]);
      }
    } else {
      const newCollaboratore: Collaboratore = {
        id: this.nextId++,
        ...this.form
      };
      this.collaboratori.set([...current, newCollaboratore]);
    }

    this.closeForm();
  }

  deleteCollaboratore(id: number): void {
    const current = this.collaboratori();
    this.collaboratori.set(current.filter((c) => c.id !== id));
  }

  private loadCollaboratori(): void {
    this.collaboratori.set(this.fakeData.getCollaboratori());
  }
}
