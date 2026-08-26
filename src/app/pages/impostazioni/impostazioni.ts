import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface SettingItem {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface AziendaProfile {
  nome: string;
  indirizzo: string;
  email: string;
  telefono: string;
  partitaIva: string;
}

interface LicenzaSoftware {
  scadenza: string;
  rinnovoAutomatico: boolean;
}

interface CollaboratoreAccesso {
  id: number;
  nome: string;
  cognome: string;
  ruolo: string;
  enabled: boolean;
}

interface TelemetriaMezzo {
  mezzoId: number;
  posizione: string;
  coordinate: string;
  ultimoAggiornamento: string;
  caricoDisponibile: string;
  capacitaCarico: string;
  temperatura: string;
  velocita: string;
  autonomia: string;
  statoMotore: string;
}

type SettingsTab = 'generale' | 'sistema' | 'licenza' | 'accessi' | 'telemetria';

@Component({
  selector: 'app-impostazioni',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './impostazioni.html',
  styleUrl: './impostazioni.scss'
})
export class Impostazioni {
  readonly companyProfile: AziendaProfile = {
    nome: 'FutureDelivery S.r.l.',
    indirizzo: 'Via Roma 18, Milano',
    email: 'amministrazione@futuredelivery.it',
    telefono: '+39 02 555 0188',
    partitaIva: 'IT12345678901'
  };

  readonly licenza: LicenzaSoftware = {
    scadenza: '31/12/2026',
    rinnovoAutomatico: true
  };

  readonly tabs: { key: SettingsTab; label: string }[] = [
    { key: 'generale', label: 'Generale' },
    { key: 'sistema', label: 'Sistema' },
    { key: 'licenza', label: 'Licenza' },
    { key: 'accessi', label: 'Accessi' },
    { key: 'telemetria', label: 'Telemetria Pro' }
  ];

  readonly activeTab = signal<SettingsTab>('generale');

  readonly telemetriaProAbilitata = true;
  readonly mezzoTelemetriaId = signal(1);

  readonly mezziTelemetria = [
    { id: 1, targa: 'AB123CD', modello: 'Iveco Daily' },
    { id: 2, targa: 'EF456GH', modello: 'Fiat Ducato' },
    { id: 3, targa: 'IL789MN', modello: 'Mercedes Sprinter' },
    { id: 4, targa: 'OP321QR', modello: 'Piaggio Porter' },
    { id: 5, targa: 'ST654UV', modello: 'Renault Master' }
  ];

  readonly telemetrie: TelemetriaMezzo[] = [
    { mezzoId: 1, posizione: 'Via Torino 42, Milano', coordinate: '45.4642° N, 9.1900° E', ultimoAggiornamento: '26/08/2026 · 10:42', caricoDisponibile: '420 kg', capacitaCarico: '1.200 kg', temperatura: '4,8 °C', velocita: '38 km/h', autonomia: '286 km', statoMotore: 'Acceso' },
    { mezzoId: 2, posizione: 'Viale Europa 16, Monza', coordinate: '45.5845° N, 9.2744° E', ultimoAggiornamento: '26/08/2026 · 10:39', caricoDisponibile: '780 kg', capacitaCarico: '1.500 kg', temperatura: '6,2 °C', velocita: '0 km/h', autonomia: '412 km', statoMotore: 'In sosta' },
    { mezzoId: 3, posizione: 'Officina Nord, Milano', coordinate: '45.5156° N, 9.2198° E', ultimoAggiornamento: '26/08/2026 · 09:58', caricoDisponibile: '0 kg', capacitaCarico: '1.500 kg', temperatura: '18,4 °C', velocita: '0 km/h', autonomia: '0 km', statoMotore: 'Manutenzione' },
    { mezzoId: 4, posizione: 'Via Garibaldi 7, Sesto San Giovanni', coordinate: '45.5340° N, 9.2370° E', ultimoAggiornamento: '26/08/2026 · 10:35', caricoDisponibile: '96 kg', capacitaCarico: '650 kg', temperatura: '7,1 °C', velocita: '24 km/h', autonomia: '154 km', statoMotore: 'Acceso' },
    { mezzoId: 5, posizione: 'Deposito FutureDelivery, Milano', coordinate: '45.4862° N, 9.2045° E', ultimoAggiornamento: '25/08/2026 · 18:12', caricoDisponibile: '0 kg', capacitaCarico: '1.500 kg', temperatura: '19,1 °C', velocita: '0 km/h', autonomia: '0 km', statoMotore: 'Fuori servizio' }
  ];

  readonly accessiCollaboratori = signal<CollaboratoreAccesso[]>([
    { id: 1, nome: 'Marco', cognome: 'Rossi', ruolo: 'Autista', enabled: true },
    { id: 2, nome: 'Giulia', cognome: 'Bianchi', ruolo: 'Magazziniere', enabled: true },
    { id: 3, nome: 'Luca', cognome: 'Verdi', ruolo: 'Autista', enabled: false },
    { id: 4, nome: 'Sara', cognome: 'Neri', ruolo: 'Responsabile logistica', enabled: true },
    { id: 5, nome: 'Davide', cognome: 'Gialli', ruolo: 'Autista', enabled: false }
  ]);

  readonly settings = signal<SettingItem[]>([
    { key: 'email', label: 'Notifiche e-mail', description: 'Invio automatico di avvisi e report aziendali.', enabled: true },
    { key: 'sms', label: 'Notifiche SMS', description: 'Avvisi urgenti per consegne e ritardi.', enabled: false },
    { key: 'backup', label: 'Backup automatico', description: 'Salvataggio giornaliero dei dati di gestione.', enabled: true },
    { key: 'audit', label: 'Audit log', description: 'Tracciamento completo delle modifiche ai dati.', enabled: true },
    { key: 'maintenance', label: 'Modalità manutenzione', description: 'Blocca l’accesso agli utenti non amministrativi.', enabled: false },
    { key: 'twoFactor', label: 'Autenticazione a due fattori', description: 'Protezione avanzata per il login amministrativo.', enabled: true }
  ]);

  get enabledSettings(): number {
    return this.settings().filter((setting) => setting.enabled).length;
  }

  get totalSettings(): number {
    return this.settings().length;
  }

  get accessiAbilitati(): number {
    return this.accessiCollaboratori().filter((c) => c.enabled).length;
  }

  get mezzoTelemetria(): { targa: string; modello: string } | undefined {
    return this.mezziTelemetria.find((mezzo) => mezzo.id === this.mezzoTelemetriaId());
  }

  get telemetriaSelezionata(): TelemetriaMezzo | undefined {
    return this.telemetrie.find((telemetria) => telemetria.mezzoId === this.mezzoTelemetriaId());
  }

  get statoLicenza(): string {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const data = this.parseDate(this.licenza.scadenza);

    if (!data) {
      return 'Da verificare';
    }

    const giorniMancanti = Math.floor((data.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24));

    if (giorniMancanti < 0) {
      return 'Scaduta';
    }
    if (giorniMancanti <= 30) {
      return 'In scadenza';
    }

    return 'Attiva';
  }

  selectTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  selectMezzoTelemetria(id: number): void {
    this.mezzoTelemetriaId.set(id);
  }

  toggleSetting(key: string): void {
    this.settings.update((list) =>
      list.map((setting) =>
        setting.key === key ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  }

  toggleAccesso(id: number): void {
    this.accessiCollaboratori.update((list) =>
      list.map((collaboratore) =>
        collaboratore.id === id ? { ...collaboratore, enabled: !collaboratore.enabled } : collaboratore
      )
    );
  }

  private parseDate(date: string): Date | null {
    const parts = date.split('/');
    if (parts.length !== 3) {
      return null;
    }

    const [giorno, mese, anno] = parts.map(Number);
    if (!giorno || !mese || !anno) {
      return null;
    }

    return new Date(anno, mese - 1, giorno);
  }
}
