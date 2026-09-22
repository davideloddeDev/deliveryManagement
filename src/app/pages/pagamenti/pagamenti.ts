import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FakeDataService, Pagamento } from '../../core/fake-data.service';

type TipoPagamento = 'Stipendi' | 'Mezzi' | 'Attrezzature';
type StatoPagamento = 'Pagato' | 'In sospeso' | 'Rifiutato';

type PagamentoForm = Omit<Pagamento, 'id'> & { tipo: TipoPagamento };

@Component({
  selector: 'app-pagamenti',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './pagamenti.html',
  styleUrl: './pagamenti.scss'
})
export class Pagamenti {
  private readonly fakeData = inject(FakeDataService);
  private nextId = 100;

  readonly tabs: TipoPagamento[] = ['Stipendi', 'Mezzi', 'Attrezzature'];
  readonly activeTab = signal<TipoPagamento>('Stipendi');

  readonly pagamenti = signal<Pagamento[]>([]);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: PagamentoForm = this.emptyForm();

  constructor() {
    this.loadPagamenti();
  }

  get pagamentiFiltrati(): Pagamento[] {
    return this.pagamenti();
  }

  get totaleImporto(): number {
    return this.pagamentiFiltrati.reduce((sum, p) => sum + p.importo, 0);
  }

  get totalePagati(): number {
    return this.pagamentiFiltrati.filter((p) => p.stato === 'Pagato').length;
  }

  get totaleDaPagare(): number {
    return this.pagamentiFiltrati.filter((p) => p.stato === 'In sospeso').length;
  }

  get importoDaPagare(): number {
    return this.pagamentiFiltrati.filter((p) => p.stato === 'In sospeso').reduce((sum, p) => sum + p.importo, 0);
  }

  selectTab(tab: TipoPagamento): void {
    this.activeTab.set(tab);
  }

  private emptyForm(): PagamentoForm {
    return {
      data: '',
      fornitore: '',
      importo: 0,
      descrizione: '',
      riferimento: '',
      stato: 'In sospeso',
      tipo: 'Stipendi'
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
    this.form = { ...rest, tipo: 'Stipendi' };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  savePagamento(): void {
    if (!this.form.fornitore || !this.form.descrizione) {
      return;
    }

    const editingId = this.editingId();
    const current = this.pagamenti();

    if (editingId !== null) {
      const index = current.findIndex((p) => p.id === editingId);
      if (index !== -1) {
        current[index] = { 
          ...current[index], 
          data: this.form.data,
          fornitore: this.form.fornitore,
          importo: this.form.importo,
          descrizione: this.form.descrizione,
          riferimento: this.form.riferimento,
          stato: this.form.stato
        };
        this.pagamenti.set([...current]);
      }
    } else {
      const newPagamento: Pagamento = {
        id: this.nextId++,
        data: this.form.data,
        fornitore: this.form.fornitore,
        importo: this.form.importo,
        descrizione: this.form.descrizione,
        riferimento: this.form.riferimento,
        stato: this.form.stato
      };
      this.pagamenti.set([...current, newPagamento]);
    }

    this.closeForm();
  }

  segnaComePagato(pagamento: Pagamento): void {
    const current = this.pagamenti();
    const index = current.findIndex((p) => p.id === pagamento.id);
    if (index !== -1) {
      current[index].stato = 'Pagato';
      this.pagamenti.set([...current]);
    }
  }

  deletePagamento(id: number): void {
    const current = this.pagamenti();
    this.pagamenti.set(current.filter((p) => p.id !== id));
  }

  private loadPagamenti(): void {
    this.pagamenti.set(this.fakeData.getPagamenti());
  }
}
