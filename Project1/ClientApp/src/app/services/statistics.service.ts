import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlightUserResult } from '../models/flightStepResult.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private statisticsSubject = new BehaviorSubject<FlightUserResult | null>(null);
  public getStatistics$ = this.statisticsSubject.asObservable();

  constructor() { }

  public saveStats(result: FlightUserResult): void {
    this.statisticsSubject.next(result);
  }

}
