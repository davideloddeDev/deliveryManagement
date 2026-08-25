import { Component } from '@angular/core';

interface KpiCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
}

interface RecentDelivery {
  id: string;
  cliente: string;
  mezzo: string;
  stato: 'Consegnato' | 'In transito' | 'In attesa';
  data: string;
}

interface WeeklyRevenue {
  day: string;
  value: number;
}

interface StatusSlice {
  label: string;
  value: number;
  color: string;
}

interface RankedItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  readonly kpiCards: KpiCard[] = [
    { label: 'Consegne del mese', value: '482', trend: '+12%', trendUp: true, icon: 'consegne' },
    { label: 'Mezzi attivi', value: '18', trend: '+2', trendUp: true, icon: 'mezzi' },
    { label: 'Collaboratori', value: '32', trend: '0', trendUp: true, icon: 'collaboratori' },
    { label: 'Entrate del mese', value: '€ 24.350', trend: '-4%', trendUp: false, icon: 'entrate' }
  ];

  readonly weeklyRevenue: WeeklyRevenue[] = [
    { day: 'Lun', value: 3200 },
    { day: 'Mar', value: 4100 },
    { day: 'Mer', value: 2800 },
    { day: 'Gio', value: 5200 },
    { day: 'Ven', value: 4700 },
    { day: 'Sab', value: 3900 },
    { day: 'Dom', value: 1600 }
  ];

  readonly maxRevenue = Math.max(...this.weeklyRevenue.map((r) => r.value));

  readonly recentDeliveries: RecentDelivery[] = [
    { id: '#FD-1042', cliente: 'Rossi Logistics', mezzo: 'Furgone 04', stato: 'Consegnato', data: '25/08 09:12' },
    { id: '#FD-1041', cliente: 'Bianchi Srl', mezzo: 'Furgone 11', stato: 'In transito', data: '25/08 08:47' },
    { id: '#FD-1040', cliente: 'Verdi Distribuzione', mezzo: 'Furgone 02', stato: 'In attesa', data: '25/08 08:15' },
    { id: '#FD-1039', cliente: 'Neri Trasporti', mezzo: 'Furgone 07', stato: 'Consegnato', data: '24/08 17:30' },
    { id: '#FD-1038', cliente: 'Gialli Market', mezzo: 'Furgone 09', stato: 'Consegnato', data: '24/08 16:05' }
  ];

  readonly statusSlices: StatusSlice[] = [
    { label: 'Consegnato', value: 68, color: '#12b76a' },
    { label: 'In transito', value: 21, color: '#1570ef' },
    { label: 'In attesa', value: 11, color: '#f79009' }
  ];

  readonly statusChartGradient = this.buildConicGradient(this.statusSlices);

  readonly topMezzi: RankedItem[] = [
    { label: 'Furgone 04', value: 96 },
    { label: 'Furgone 11', value: 82 },
    { label: 'Furgone 02', value: 74 },
    { label: 'Furgone 09', value: 61 },
    { label: 'Furgone 07', value: 48 }
  ];

  readonly maxMezzi = Math.max(...this.topMezzi.map((m) => m.value));

  readonly paymentMethods: RankedItem[] = [
    { label: 'Bonifico', value: 12400 },
    { label: 'Carta di credito', value: 7300 },
    { label: 'Contanti', value: 3150 },
    { label: 'Assegno', value: 1500 }
  ];

  readonly maxPayment = Math.max(...this.paymentMethods.map((p) => p.value));

  barHeight(value: number): number {
    return Math.round((value / this.maxRevenue) * 100);
  }

  rankedWidth(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }

  private buildConicGradient(slices: StatusSlice[]): string {
    let cursor = 0;
    const stops = slices.map((slice) => {
      const start = cursor;
      cursor += slice.value;
      return `${slice.color} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }
}
