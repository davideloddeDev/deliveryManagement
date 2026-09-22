import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FakeDataService, Consegna } from '../../core/fake-data.service';

type StatoConsegna = 'In attesa' | 'In transito' | 'Consegnato' | 'Annullata';
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
  private readonly fakeData = inject(FakeDataService);
  private readonly refreshMs = 30000;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private nextId = 100;

  readonly consegne = signal<Consegna[]>([]);

  readonly statiConsegna: StatoConsegna[] = ['In attesa', 'In transito', 'Consegnato', 'Annullata'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly searchTerm = signal('');
  form: ConsegnaForm = { ...EMPTY_FORM };

  constructor() {
    this.loadConsegne();
    this.refreshTimer = setInterval(() => {
      this.loadConsegne();
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

  saveConsegna(): void {
    if (!this.form.codice || !this.form.cliente) {
      return;
    }

    const editingId = this.editingId();
    const current = this.consegne();

    if (editingId !== null) {
      const index = current.findIndex((c) => c.id === editingId);
      if (index !== -1) {
        current[index] = { ...current[index], ...this.form };
        this.consegne.set([...current]);
      }
    } else {
      const newConsegna: Consegna = {
        id: this.nextId++,
        ...this.form
      };
      this.consegne.set([...current, newConsegna]);
    }

    this.closeForm();
  }

  deleteConsegna(id: number): void {
    const current = this.consegne();
    this.consegne.set(current.filter((c) => c.id !== id));
  }

  private loadConsegne(): void {
    this.consegne.set(this.fakeData.getConsegne());
  }
}
