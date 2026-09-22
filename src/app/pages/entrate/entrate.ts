import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FakeDataService, Entrata } from '../../core/fake-data.service';

type TipoEntrata = 'Fatture' | 'Vendite' | 'Rimborsi';
type StatoEntrata = 'Incassato' | 'In attesa';

type EntrataForm = Omit<Entrata, 'id'> & { tipo: TipoEntrata; stato: StatoEntrata };

@Component({
  selector: 'app-entrate',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './entrate.html',
  styleUrl: './entrate.scss'
})
export class Entrate {
  private readonly fakeData = inject(FakeDataService);
  private nextId = 100;

  readonly tabs: TipoEntrata[] = ['Fatture', 'Vendite', 'Rimborsi'];
  readonly activeTab = signal<TipoEntrata>('Fatture');

  readonly entrate = signal<Entrata[]>([]);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: EntrataForm = this.emptyForm();

  constructor() {
    this.loadEntrate();
  }

  get entrateFiltrate(): Entrata[] {
    return this.entrate();
  }

  get totaleImporto(): number {
    return this.entrateFiltrate.reduce((sum, e) => sum + e.importo, 0);
  }

  get incassate(): number {
    return this.entrateFiltrate.length;
  }

  get inAttesa(): number {
    return 0;
  }

  get importoInAttesa(): number {
    return 0;
  }

  selectTab(tab: TipoEntrata): void {
    this.activeTab.set(tab);
  }

  private emptyForm(): EntrataForm {
    return {
      data: '',
      descrizione: '',
      importo: 0,
      categoria: 'Consegne',
      metodo: 'Bonifico',
      cliente: '',
      tipo: 'Fatture',
      stato: 'In attesa'
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
    this.form = { ...rest, tipo: 'Fatture', stato: 'Incassato' };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveEntrata(): void {
    if (!this.form.descrizione) {
      return;
    }

    const editingId = this.editingId();
    const current = this.entrate();

    if (editingId !== null) {
      const index = current.findIndex((e) => e.id === editingId);
      if (index !== -1) {
        current[index] = { 
          ...current[index], 
          data: this.form.data,
          descrizione: this.form.descrizione,
          importo: this.form.importo,
          categoria: this.form.categoria,
          metodo: this.form.metodo,
          cliente: this.form.cliente,
          stato: this.form.stato
        };
        this.entrate.set([...current]);
      }
    } else {
      const newEntrata: Entrata = {
        id: this.nextId++,
        data: this.form.data,
        descrizione: this.form.descrizione,
        importo: this.form.importo,
        categoria: this.form.categoria,
        metodo: this.form.metodo,
        cliente: this.form.cliente,
        stato: this.form.stato
      };
      this.entrate.set([...current, newEntrata]);
    }

    this.closeForm();
  }

  segnaComeIncassato(entrata: Entrata): void {
    // Placeholder per incasso
  }

  deleteEntrata(id: number): void {
    const current = this.entrate();
    this.entrate.set(current.filter((e) => e.id !== id));
  }

  private loadEntrate(): void {
    this.entrate.set(this.fakeData.getEntrate());
  }
}
