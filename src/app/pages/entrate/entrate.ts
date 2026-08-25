import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  private nextId = 8;

  readonly tabs: TipoEntrata[] = ['Fatture', 'Vendite', 'Rimborsi'];
  readonly activeTab = signal<TipoEntrata>('Fatture');

  readonly entrate = signal<Entrata[]>([
    { id: 1, tipo: 'Fatture', cliente: 'Rossi Logistics', descrizione: 'Fattura n. 2026/140', importo: 3200, stato: 'Incassato', data: '18/08/2026' },
    { id: 2, tipo: 'Fatture', cliente: 'Bianchi Srl', descrizione: 'Fattura n. 2026/141', importo: 1850, stato: 'In attesa', data: '20/08/2026' },
    { id: 3, tipo: 'Vendite', cliente: 'Nord Materiali', descrizione: 'Vendita pallet e imballaggi', importo: 920, stato: 'Incassato', data: '22/08/2026' },
    { id: 4, tipo: 'Vendite', cliente: 'Verdi Distribuzione', descrizione: 'Variazione ordine urgente', importo: 1460, stato: 'In attesa', data: '24/08/2026' },
    { id: 5, tipo: 'Rimborsi', cliente: 'Futura Service', descrizione: 'Rimborso spese carburante', importo: 280, stato: 'Incassato', data: '16/08/2026' },
    { id: 6, tipo: 'Rimborsi', cliente: 'ECO Transport', descrizione: 'Rimborso pedaggi', importo: 160, stato: 'In attesa', data: '25/08/2026' },
    { id: 7, tipo: 'Fatture', cliente: 'Gialli Market', descrizione: 'Fattura n. 2026/152', importo: 2580, stato: 'In attesa', data: '26/08/2026' }
  ]);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: EntrataForm = this.emptyForm();

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

  saveEntrata(): void {
    if (!this.form.cliente || !this.form.descrizione) {
      return;
    }

    const editingId = this.editingId();
    if (editingId !== null) {
      this.entrate.update((list) =>
        list.map((e) => (e.id === editingId ? { id: editingId, ...this.form } : e))
      );
    } else {
      this.entrate.update((list) => [...list, { id: this.nextId++, ...this.form }]);
    }

    this.closeForm();
  }

  segnaComeIncassato(entrata: Entrata): void {
    this.entrate.update((list) =>
      list.map((e) => (e.id === entrata.id ? { ...e, stato: 'Incassato' } : e))
    );
  }

  deleteEntrata(id: number): void {
    this.entrate.update((list) => list.filter((e) => e.id !== id));
  }
}
