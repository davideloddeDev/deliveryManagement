import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class Consegne {
  private nextId = 6;

  readonly consegne = signal<Consegna[]>([
    { id: 1, codice: '#FD-1042', cliente: 'Rossi Logistics', indirizzo: 'Via Roma 12, Milano', targaMezzo: 'AB123CD', autista: 'Marco Rossi', stato: 'Consegnato', dataConsegna: '25/08/2026 09:12', importo: 145 },
    { id: 2, codice: '#FD-1041', cliente: 'Bianchi Srl', indirizzo: 'Via Torino 45, Milano', targaMezzo: 'IL789MN', autista: 'Luca Verdi', stato: 'In transito', dataConsegna: '25/08/2026 08:47', importo: 210 },
    { id: 3, codice: '#FD-1040', cliente: 'Verdi Distribuzione', indirizzo: 'Corso Genova 8, Torino', targaMezzo: 'OP321QR', autista: 'Davide Gialli', stato: 'In attesa', dataConsegna: '25/08/2026 08:15', importo: 98 },
    { id: 4, codice: '#FD-1039', cliente: 'Neri Trasporti', indirizzo: 'Via Napoli 3, Bologna', targaMezzo: 'EF456GH', autista: 'Marco Rossi', stato: 'Consegnato', dataConsegna: '24/08/2026 17:30', importo: 176 },
    { id: 5, codice: '#FD-1038', cliente: 'Gialli Market', indirizzo: 'Via Firenze 21, Bologna', targaMezzo: 'ST654UV', autista: 'Luca Verdi', stato: 'Annullata', dataConsegna: '24/08/2026 16:05', importo: 0 }
  ]);

  readonly statiConsegna: StatoConsegna[] = ['In attesa', 'In transito', 'Consegnato', 'Annullata'];

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly searchTerm = signal('');
  form: ConsegnaForm = { ...EMPTY_FORM };

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
    if (editingId !== null) {
      this.consegne.update((list) =>
        list.map((c) => (c.id === editingId ? { id: editingId, ...this.form } : c))
      );
    } else {
      this.consegne.update((list) => [...list, { id: this.nextId++, ...this.form }]);
    }

    this.closeForm();
  }

  deleteConsegna(id: number): void {
    this.consegne.update((list) => list.filter((c) => c.id !== id));
  }
}
