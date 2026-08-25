import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TipoPagamento = 'Stipendi' | 'Mezzi' | 'Attrezzature';
type StatoPagamento = 'Pagato' | 'Da pagare';

interface Pagamento {
  id: number;
  tipo: TipoPagamento;
  riferimento: string;
  descrizione: string;
  importo: number;
  stato: StatoPagamento;
  data: string;
}

type PagamentoForm = Omit<Pagamento, 'id'>;

@Component({
  selector: 'app-pagamenti',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './pagamenti.html',
  styleUrl: './pagamenti.scss'
})
export class Pagamenti {
  private nextId = 8;

  readonly tabs: TipoPagamento[] = ['Stipendi', 'Mezzi', 'Attrezzature'];
  readonly activeTab = signal<TipoPagamento>('Stipendi');

  readonly pagamenti = signal<Pagamento[]>([
    { id: 1, tipo: 'Stipendi', riferimento: 'Marco Rossi', descrizione: 'Stipendio Agosto 2026', importo: 1650, stato: 'Pagato', data: '27/08/2026' },
    { id: 2, tipo: 'Stipendi', riferimento: 'Giulia Bianchi', descrizione: 'Stipendio Agosto 2026', importo: 1480, stato: 'Da pagare', data: '27/08/2026' },
    { id: 3, tipo: 'Stipendi', riferimento: 'Luca Verdi', descrizione: 'Stipendio Agosto 2026', importo: 1650, stato: 'Da pagare', data: '27/08/2026' },
    { id: 4, tipo: 'Mezzi', riferimento: 'AB123CD', descrizione: 'Assicurazione RCA', importo: 620, stato: 'Pagato', data: '15/10/2026' },
    { id: 5, tipo: 'Mezzi', riferimento: 'IL789MN', descrizione: 'Tagliando e manutenzione', importo: 340, stato: 'Da pagare', data: '05/09/2026' },
    { id: 6, tipo: 'Attrezzature', riferimento: 'Carrello elevatore 01', descrizione: 'Revisione annuale', importo: 210, stato: 'Da pagare', data: '12/09/2026' },
    { id: 7, tipo: 'Attrezzature', riferimento: 'Scanner barcode x4', descrizione: 'Acquisto nuovi dispositivi', importo: 480, stato: 'Pagato', data: '02/08/2026' }
  ]);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: PagamentoForm = this.emptyForm();

  get pagamentiFiltrati(): Pagamento[] {
    return this.pagamenti().filter((p) => p.tipo === this.activeTab());
  }

  get totaleImporto(): number {
    return this.pagamentiFiltrati.reduce((sum, p) => sum + p.importo, 0);
  }

  get totalePagati(): number {
    return this.pagamentiFiltrati.filter((p) => p.stato === 'Pagato').length;
  }

  get totaleDaPagare(): number {
    return this.pagamentiFiltrati.filter((p) => p.stato === 'Da pagare').length;
  }

  get importoDaPagare(): number {
    return this.pagamentiFiltrati.filter((p) => p.stato === 'Da pagare').reduce((sum, p) => sum + p.importo, 0);
  }

  selectTab(tab: TipoPagamento): void {
    this.activeTab.set(tab);
  }

  private emptyForm(): PagamentoForm {
    return {
      tipo: this.activeTab(),
      riferimento: '',
      descrizione: '',
      importo: 0,
      stato: 'Da pagare',
      data: ''
    };
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  openEditForm(pagamento: Pagamento): void {
    this.editingId.set(pagamento.id);
    const { id, ...rest } = pagamento;
    this.form = { ...rest };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  savePagamento(): void {
    if (!this.form.riferimento || !this.form.descrizione) {
      return;
    }

    const editingId = this.editingId();
    if (editingId !== null) {
      this.pagamenti.update((list) =>
        list.map((p) => (p.id === editingId ? { id: editingId, ...this.form } : p))
      );
    } else {
      this.pagamenti.update((list) => [...list, { id: this.nextId++, ...this.form }]);
    }

    this.closeForm();
  }

  segnaComePagato(pagamento: Pagamento): void {
    this.pagamenti.update((list) =>
      list.map((p) => (p.id === pagamento.id ? { ...p, stato: 'Pagato' } : p))
    );
  }

  deletePagamento(id: number): void {
    this.pagamenti.update((list) => list.filter((p) => p.id !== id));
  }
}
