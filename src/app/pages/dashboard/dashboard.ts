import { Component, OnDestroy, inject } from '@angular/core';
import { FakeDataService } from '../../core/fake-data.service';

type KpiCard = ReturnType<FakeDataService['getDashboardKpis']>[0];
type RecentDelivery = ReturnType<FakeDataService['getDashboardRecentDeliveries']>[0];
type WeeklyRevenue = ReturnType<FakeDataService['getDashboardWeeklyRevenue']>[0];
type StatusSlice = ReturnType<FakeDataService['getDashboardStatusSlices']>[0];
type RankedItem = ReturnType<FakeDataService['getDashboardRankedVehicles']>[0];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnDestroy {
  private readonly fakeData = inject(FakeDataService);
  private readonly refreshMs = 30000;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  kpiCards: KpiCard[] = [];
  weeklyRevenue: WeeklyRevenue[] = [];
  recentDeliveries: RecentDelivery[] = [];
  statusSlices: StatusSlice[] = [];
  topMezzi: RankedItem[] = [];
  paymentMethods: RankedItem[] = [];

  get maxRevenue(): number {
    return Math.max(...this.weeklyRevenue.map((r) => r.value), 1);
  }

  get statusChartGradient(): string {
    return this.buildConicGradient(this.statusSlices);
  }

  get maxMezzi(): number {
    return Math.max(...this.topMezzi.map((m) => m.value), 1);
  }

  get maxPayment(): number {
    return Math.max(...this.paymentMethods.map((p) => p.value), 1);
  }

  constructor() {
    this.loadDashboardData();
    this.refreshTimer = setInterval(() => {
      this.loadDashboardData();
    }, this.refreshMs);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private loadDashboardData(): void {
    this.kpiCards = this.fakeData.getDashboardKpis();
    this.weeklyRevenue = this.fakeData.getDashboardWeeklyRevenue();
    this.statusSlices = this.fakeData.getDashboardStatusSlices();
    this.recentDeliveries = this.fakeData.getDashboardRecentDeliveries();
    this.topMezzi = this.fakeData.getDashboardRankedVehicles();
    this.paymentMethods = this.fakeData.getDashboardPaymentMethods();
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
