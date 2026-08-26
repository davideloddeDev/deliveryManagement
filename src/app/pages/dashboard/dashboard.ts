import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS, POLLING_CONFIG } from '../../core/api-endpoints';

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
export class Dashboard implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly refreshMs = POLLING_CONFIG.dashboardMs;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  kpiCards: KpiCard[] = [
    { label: 'Consegne del mese', value: '482', trend: '+12%', trendUp: true, icon: 'consegne' },
    { label: 'Mezzi attivi', value: '18', trend: '+2', trendUp: true, icon: 'mezzi' },
    { label: 'Collaboratori', value: '32', trend: '0', trendUp: true, icon: 'collaboratori' },
    { label: 'Entrate del mese', value: '€ 24.350', trend: '-4%', trendUp: false, icon: 'entrate' }
  ];

  weeklyRevenue: WeeklyRevenue[] = [
    { day: 'Lun', value: 3200 },
    { day: 'Mar', value: 4100 },
    { day: 'Mer', value: 2800 },
    { day: 'Gio', value: 5200 },
    { day: 'Ven', value: 4700 },
    { day: 'Sab', value: 3900 },
    { day: 'Dom', value: 1600 }
  ];

  get maxRevenue(): number {
    return Math.max(...this.weeklyRevenue.map((r) => r.value), 1);
  }

  recentDeliveries: RecentDelivery[] = [
    { id: '#FD-1042', cliente: 'Rossi Logistics', mezzo: 'Furgone 04', stato: 'Consegnato', data: '25/08 09:12' },
    { id: '#FD-1041', cliente: 'Bianchi Srl', mezzo: 'Furgone 11', stato: 'In transito', data: '25/08 08:47' },
    { id: '#FD-1040', cliente: 'Verdi Distribuzione', mezzo: 'Furgone 02', stato: 'In attesa', data: '25/08 08:15' },
    { id: '#FD-1039', cliente: 'Neri Trasporti', mezzo: 'Furgone 07', stato: 'Consegnato', data: '24/08 17:30' },
    { id: '#FD-1038', cliente: 'Gialli Market', mezzo: 'Furgone 09', stato: 'Consegnato', data: '24/08 16:05' }
  ];

  statusSlices: StatusSlice[] = [
    { label: 'Consegnato', value: 68, color: '#12b76a' },
    { label: 'In transito', value: 21, color: '#1570ef' },
    { label: 'In attesa', value: 11, color: '#f79009' }
  ];

  get statusChartGradient(): string {
    return this.buildConicGradient(this.statusSlices);
  }

  topMezzi: RankedItem[] = [
    { label: 'Furgone 04', value: 96 },
    { label: 'Furgone 11', value: 82 },
    { label: 'Furgone 02', value: 74 },
    { label: 'Furgone 09', value: 61 },
    { label: 'Furgone 07', value: 48 }
  ];

  get maxMezzi(): number {
    return Math.max(...this.topMezzi.map((m) => m.value), 1);
  }

  paymentMethods: RankedItem[] = [
    { label: 'Bonifico', value: 12400 },
    { label: 'Carta di credito', value: 7300 },
    { label: 'Contanti', value: 3150 },
    { label: 'Assegno', value: 1500 }
  ];

  get maxPayment(): number {
    return Math.max(...this.paymentMethods.map((p) => p.value), 1);
  }

  constructor() {
    void this.loadDashboardData();
    this.refreshTimer = setInterval(() => {
      void this.loadDashboardData();
    }, this.refreshMs);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async loadDashboardData(): Promise<void> {
    try {
      const summary = await firstValueFrom(
        this.http.get<{ consegne: number; mezziAttivi: number; collaboratori: number; entrate: number }>(
          API_ENDPOINTS.dashboard.summary
        )
      );

      this.kpiCards = [
        { label: 'Consegne del mese', value: String(summary.consegne), trend: '-', trendUp: true, icon: 'consegne' },
        { label: 'Mezzi attivi', value: String(summary.mezziAttivi), trend: '-', trendUp: true, icon: 'mezzi' },
        { label: 'Collaboratori', value: String(summary.collaboratori), trend: '-', trendUp: true, icon: 'collaboratori' },
        { label: 'Entrate del mese', value: `€ ${Number(summary.entrate || 0).toLocaleString('it-IT')}`, trend: '-', trendUp: true, icon: 'entrate' }
      ];

      const revenue = await firstValueFrom(
        this.http.get<Array<{ data: string; importo: number }>>(API_ENDPOINTS.dashboard.revenue)
      );

      const grouped = new Map<string, number>();
      for (const item of revenue) {
        const label = this.weekDayLabel(item.data);
        grouped.set(label, (grouped.get(label) || 0) + Number(item.importo || 0));
      }
      this.weeklyRevenue = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => ({
        day,
        value: grouped.get(day) || 0
      }));

      const statuses = await firstValueFrom(
        this.http.get<Array<{ stato: string; totale: number; percentuale: number }>>(API_ENDPOINTS.dashboard.deliveryStatus)
      );
      this.statusSlices = statuses.map((item) => ({
        label: item.stato,
        value: item.percentuale,
        color: this.statusColor(item.stato)
      }));

      const recent = await firstValueFrom(
        this.http.get<{ data: Array<{ id: number; codice?: string; cliente: string; stato: RecentDelivery['stato']; updatedAt?: string; mezzoId?: number }> }>(
          API_ENDPOINTS.dashboard.recentDeliveries
        )
      );
      this.recentDeliveries = (recent.data || []).map((item) => ({
        id: item.codice || `#FD-${item.id}`,
        cliente: item.cliente,
        mezzo: item.mezzoId ? `Mezzo ${item.mezzoId}` : '-',
        stato: this.normalizeDeliveryStatus(item.stato),
        data: this.shortDate(item.updatedAt)
      }));

      const topVehicles = await firstValueFrom(
        this.http.get<{ data: Array<{ targa?: string; modello?: string }> }>(API_ENDPOINTS.dashboard.topVehicles)
      );
      const vehicleUsage = new Map<string, number>();
      for (const item of topVehicles.data || []) {
        const label = item.targa || item.modello || 'Mezzo';
        vehicleUsage.set(label, (vehicleUsage.get(label) || 0) + 1);
      }
      this.topMezzi = Array.from(vehicleUsage.entries()).map(([label, value]) => ({ label, value }));

      const methods = await firstValueFrom(
        this.http.get<Record<string, number>>(API_ENDPOINTS.dashboard.paymentMethods)
      );
      this.paymentMethods = Object.entries(methods || {}).map(([label, value]) => ({
        label,
        value: Number(value || 0)
      }));
    } catch {
      // Mantiene i dati mock in caso di errore API.
    }
  }

  private weekDayLabel(dateInput?: string): string {
    if (!dateInput) {
      return 'Lun';
    }
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return 'Lun';
    }
    const labels = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return labels[date.getDay()] || 'Lun';
  }

  private shortDate(dateInput?: string): string {
    if (!dateInput) {
      return '-';
    }
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private normalizeDeliveryStatus(value: string): RecentDelivery['stato'] {
    if (value === 'Consegnato') {
      return 'Consegnato';
    }
    if (value === 'In transito') {
      return 'In transito';
    }
    return 'In attesa';
  }

  private statusColor(stato: string): string {
    if (stato === 'Consegnato') {
      return '#12b76a';
    }
    if (stato === 'In transito') {
      return '#1570ef';
    }
    return '#f79009';
  }

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
