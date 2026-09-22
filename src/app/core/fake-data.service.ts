import { Injectable } from '@angular/core';

export interface KpiCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
}

export interface RecentDelivery {
  id: string;
  cliente: string;
  mezzo: string;
  stato: 'Consegnato' | 'In transito' | 'In attesa';
  data: string;
}

export interface WeeklyRevenue {
  day: string;
  value: number;
}

export interface StatusSlice {
  label: string;
  value: number;
  color: string;
}

export interface RankedItem {
  label: string;
  value: number;
}

export interface Collaboratore {
  id: number;
  nome: string;
  cognome: string;
  ruolo: string;
  telefono: string;
  email: string;
  stato: 'Attivo' | 'In malattia' | 'Cessato';
  dataAssunzione: string;
  scadenzaPatente: string;
}

export interface Consegna {
  id: number;
  codice: string;
  cliente: string;
  indirizzo: string;
  targaMezzo: string;
  autista: string;
  stato: 'In attesa' | 'In transito' | 'Consegnato' | 'Annullata';
  dataConsegna: string;
  importo: number;
}

export interface Mezzo {
  id: number;
  targa: string;
  marca: string;
  modello: string;
  anno: number;
  tipo: string;
  stato: 'Attivo' | 'In manutenzione' | 'Inattivo' | 'Fuori servizio';
  kilometraggio: number;
  km: number;
  ultimaManutenzione: string;
  compagniaAssicurativa: string;
  numeroPolizza: string;
  pagamentoAssicurazioneAutorizzato: boolean;
  scadenzaAssicurazione: string;
}

export interface Entrata {
  id: number;
  data: string;
  descrizione: string;
  importo: number;
  categoria: string;
  metodo: string;
  cliente: string;
  stato: 'Incassato' | 'In attesa';
}

export interface Pagamento {
  id: number;
  data: string;
  fornitore: string;
  importo: number;
  descrizione: string;
  riferimento: string;
  stato: 'Pagato' | 'In sospeso' | 'Rifiutato' | 'Da pagare';
}

export interface LicenseKeyItem {
  id: number;
  key: string;
  statoAttivazione: string;
  dataAttivazione: string;
  dataScadenza: string;
  dispositivi: number;
  versione: string;
}

@Injectable({ providedIn: 'root' })
export class FakeDataService {
  getDashboardKpis(): KpiCard[] {
    return [
      { label: 'Consegne del mese', value: '482', trend: '+12%', trendUp: true, icon: 'consegne' },
      { label: 'Mezzi attivi', value: '18', trend: '+2', trendUp: true, icon: 'mezzi' },
      { label: 'Collaboratori', value: '32', trend: '0', trendUp: true, icon: 'collaboratori' },
      { label: 'Entrate del mese', value: '€ 24.350', trend: '-4%', trendUp: false, icon: 'entrate' }
    ];
  }

  getDashboardWeeklyRevenue(): WeeklyRevenue[] {
    return [
      { day: 'Lun', value: 3200 },
      { day: 'Mar', value: 4100 },
      { day: 'Mer', value: 2800 },
      { day: 'Gio', value: 3900 },
      { day: 'Ven', value: 5200 },
      { day: 'Sab', value: 2100 },
      { day: 'Dom', value: 1800 }
    ];
  }

  getDashboardStatusSlices(): StatusSlice[] {
    return [
      { label: 'Consegnato', value: 65, color: '#4CAF50' },
      { label: 'In transito', value: 25, color: '#2196F3' },
      { label: 'In attesa', value: 10, color: '#FF9800' }
    ];
  }

  getDashboardRankedVehicles(): RankedItem[] {
    return [
      { label: 'Furgone blu', value: 42 },
      { label: 'Van rosso', value: 38 },
      { label: 'Camion giallo', value: 35 }
    ];
  }

  getDashboardPaymentMethods(): RankedItem[] {
    return [
      { label: 'Carta credito', value: 45 },
      { label: 'Bonifico', value: 30 },
      { label: 'Contanti', value: 25 }
    ];
  }

  getDashboardRecentDeliveries(): RecentDelivery[] {
    return [
      { id: '1', cliente: 'Acme Corp', mezzo: 'VAN-001', stato: 'Consegnato', data: '2024-01-15' },
      { id: '2', cliente: 'Beta Ltd', mezzo: 'VAN-002', stato: 'In transito', data: '2024-01-15' },
      { id: '3', cliente: 'Gamma Inc', mezzo: 'VAN-003', stato: 'In attesa', data: '2024-01-15' }
    ];
  }

  getCollaboratori(): Collaboratore[] {
    return [
      {
        id: 1,
        nome: 'Marco',
        cognome: 'Bianchi',
        ruolo: 'Autista',
        telefono: '333-1234567',
        email: 'marco.bianchi@example.com',
        stato: 'Attivo',
        dataAssunzione: '2023-01-15',
        scadenzaPatente: '2025-06-20'
      },
      {
        id: 2,
        nome: 'Anna',
        cognome: 'Rossi',
        ruolo: 'Autista',
        telefono: '333-2345678',
        email: 'anna.rossi@example.com',
        stato: 'Attivo',
        dataAssunzione: '2022-09-10',
        scadenzaPatente: '2026-03-15'
      },
      {
        id: 3,
        nome: 'Giovanni',
        cognome: 'Verdi',
        ruolo: 'Magazziniere',
        telefono: '333-3456789',
        email: 'giovanni.verdi@example.com',
        stato: 'Attivo',
        dataAssunzione: '2023-05-01',
        scadenzaPatente: '2025-12-01'
      }
    ];
  }

  getConsegne(): Consegna[] {
    return [
      {
        id: 1,
        codice: 'DEL-001',
        cliente: 'Acme Corporation',
        indirizzo: 'Via Roma 123, Milano',
        targaMezzo: 'AB-123-CD',
        autista: 'Marco Bianchi',
        stato: 'Consegnato',
        dataConsegna: '2024-01-15',
        importo: 150.00
      },
      {
        id: 2,
        codice: 'DEL-002',
        cliente: 'Beta Industries',
        indirizzo: 'Via Milano 456, Roma',
        targaMezzo: 'EF-456-GH',
        autista: 'Anna Rossi',
        stato: 'In transito',
        dataConsegna: '2024-01-15',
        importo: 200.00
      },
      {
        id: 3,
        codice: 'DEL-003',
        cliente: 'Gamma Services',
        indirizzo: 'Via Torino 789, Torino',
        targaMezzo: 'IL-789-MN',
        autista: 'Giovanni Verdi',
        stato: 'In attesa',
        dataConsegna: '2024-01-16',
        importo: 175.00
      }
    ];
  }

  getMezzi(): Mezzo[] {
    return [
      {
        id: 1,
        targa: 'AB-123-CD',
        marca: 'Fiat',
        modello: 'Ducato',
        anno: 2022,
        tipo: 'Furgone',
        stato: 'Attivo',
        kilometraggio: 45000,
        km: 45000,
        ultimaManutenzione: '2024-01-10',
        compagniaAssicurativa: 'Allianz',
        numeroPolizza: 'POL-2024-001',
        pagamentoAssicurazioneAutorizzato: true,
        scadenzaAssicurazione: '2025-06-15'
      },
      {
        id: 2,
        targa: 'EF-456-GH',
        marca: 'Mercedes',
        modello: 'Sprinter',
        anno: 2023,
        tipo: 'Furgone',
        stato: 'Attivo',
        kilometraggio: 25000,
        km: 25000,
        ultimaManutenzione: '2024-01-05',
        compagniaAssicurativa: 'Generali',
        numeroPolizza: 'POL-2024-002',
        pagamentoAssicurazioneAutorizzato: true,
        scadenzaAssicurazione: '2025-08-20'
      },
      {
        id: 3,
        targa: 'IL-789-MN',
        marca: 'Iveco',
        modello: 'Daily',
        anno: 2021,
        tipo: 'Furgone',
        stato: 'In manutenzione',
        kilometraggio: 65000,
        km: 65000,
        ultimaManutenzione: '2024-01-20',
        compagniaAssicurativa: 'UnipolSai',
        numeroPolizza: 'POL-2024-003',
        pagamentoAssicurazioneAutorizzato: false,
        scadenzaAssicurazione: '2025-04-10'
      }
    ];
  }

  getEntrate(): Entrata[] {
    return [
      {
        id: 1,
        data: '2024-01-15',
        descrizione: 'Pagamento consegna DEL-001',
        importo: 150.00,
        categoria: 'Consegne',
        metodo: 'Carta credito',
        cliente: 'Acme Corporation',
        stato: 'Incassato'
      },
      {
        id: 2,
        data: '2024-01-14',
        descrizione: 'Pagamento consegna DEL-002',
        importo: 200.00,
        categoria: 'Consegne',
        metodo: 'Bonifico',
        cliente: 'Beta Industries',
        stato: 'Incassato'
      },
      {
        id: 3,
        data: '2024-01-13',
        descrizione: 'Servizio di storage',
        importo: 500.00,
        categoria: 'Servizi',
        metodo: 'Bonifico',
        cliente: 'Gamma Services',
        stato: 'In attesa'
      }
    ];
  }

  getPagamenti(): Pagamento[] {
    return [
      {
        id: 1,
        data: '2024-01-15',
        fornitore: 'Benzina & Carburanti S.p.A.',
        importo: 450.00,
        descrizione: 'Ricarica carburante',
        riferimento: 'REF-001',
        stato: 'Pagato'
      },
      {
        id: 2,
        data: '2024-01-14',
        fornitore: 'Manutenzioni Auto S.r.l.',
        importo: 320.00,
        descrizione: 'Revisione veicolo',
        riferimento: 'REF-002',
        stato: 'Da pagare'
      },
      {
        id: 3,
        data: '2024-01-12',
        fornitore: 'Assicurazioni Generali',
        importo: 2500.00,
        descrizione: 'Polizza annuale flotta',
        riferimento: 'REF-003',
        stato: 'In sospeso'
      }
    ];
  }

  getLicenseKeys(): LicenseKeyItem[] {
    return [
      {
        id: 1,
        key: 'LICENSE-2024-PREMIUM-001',
        statoAttivazione: 'Attivo',
        dataAttivazione: '2024-01-01',
        dataScadenza: '2024-12-31',
        dispositivi: 5,
        versione: 'Professional'
      },
      {
        id: 2,
        key: 'LICENSE-2024-STANDARD-002',
        statoAttivazione: 'Attivo',
        dataAttivazione: '2024-01-10',
        dataScadenza: '2025-01-09',
        dispositivi: 2,
        versione: 'Standard'
      },
      {
        id: 3,
        key: 'LICENSE-2023-PREMIUM-003',
        statoAttivazione: 'Scaduto',
        dataAttivazione: '2023-01-01',
        dataScadenza: '2023-12-31',
        dispositivi: 3,
        versione: 'Professional'
      }
    ];
  }
}
