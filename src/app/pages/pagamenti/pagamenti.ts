import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../../core/api-endpoints';

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
  private readonly http = inject(HttpClient);

  readonly tabs: TipoPagamento[] = ['Stipendi', 'Mezzi', 'Attrezzature'];
  readonly activeTab = signal<TipoPagamento>('Stipendi');

  readonly pagamenti = signal<Pagamento[]>([]);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  form: PagamentoForm = this.emptyForm();

  constructor() {
    void this.loadPagamenti();
  }

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

  async savePagamento(): Promise<void> {
    if (!this.form.riferimento || !this.form.descrizione) {
      return;
    }

    try {
      const payload = {
        tipo: this.form.tipo,
        riferimento: this.form.riferimento,
        descrizione: this.form.descrizione,
        importo: this.form.importo,
        stato: this.form.stato,
        data: this.form.data,
        metodo: 'Bonifico'
      };

      const editingId = this.editingId();
      if (editingId !== null) {
        await firstValueFrom(this.http.patch(API_ENDPOINTS.pagamenti.byId(editingId), payload));
      } else {
        await firstValueFrom(this.http.post(API_ENDPOINTS.pagamenti.list, payload));
      }

      await this.loadPagamenti();
      this.closeForm();
    } catch {
      // Mantiene il form aperto in caso di errore API.
    }
  }

  async segnaComePagato(pagamento: Pagamento): Promise<void> {
    try {
      await firstValueFrom(this.http.patch(API_ENDPOINTS.pagamenti.markPaid(pagamento.id), {}));
      await this.loadPagamenti();
    } catch {
      // Ignora errori runtime e mantiene lo stato corrente.
    }
  }

  async deletePagamento(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(API_ENDPOINTS.pagamenti.byId(id)));
      await this.loadPagamenti();
    } catch {
      // Ignora errori runtime e mantiene lo stato corrente.
    }
  }

  private async loadPagamenti(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: Array<Record<string, unknown>> }>(API_ENDPOINTS.pagamenti.list)
      );
      const payload = (response as { data?: Array<Record<string, unknown>> }).data ?? [];
      this.pagamenti.set(payload.map((item) => {
        const source = item as Record<string, unknown>;
        return {
          id: Number(source['id'] ?? 0),
          tipo: this.normalizeTipo(String(source['tipo'] ?? 'Stipendi')),
          riferimento: String(source['riferimento'] ?? ''),
          descrizione: String(source['descrizione'] ?? ''),
          importo: Number(source['importo'] ?? 0),
          stato: this.normalizeStato(String(source['stato'] ?? 'Da pagare')),
          data: String(source['data'] ?? source['dataPagamento'] ?? '-')
        };
      }));
    } catch {
      this.pagamenti.set([]);
    }
  }

  private normalizeTipo(value: string): TipoPagamento {
    if (value === 'Mezzi' || value === 'Attrezzature') {
      return value;
    }
    return 'Stipendi';
  }

  private normalizeStato(value: string): StatoPagamento {
    if (value === 'Pagato') {
      return value;
    }
    return 'Da pagare';
  }
}
