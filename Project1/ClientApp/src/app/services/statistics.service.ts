import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { FlightEndStats, FlightUserResult } from '../models/flightStepResult.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private statisticsSubject = new BehaviorSubject<FlightEndStats | null>(null);
  public getStatistics$ = this.statisticsSubject.asObservable();

  private pathLengthSubject = new BehaviorSubject<number>(0);
  public getPathLength$ = this.pathLengthSubject.asObservable();

  constructor() { }

  public saveStats(result: FlightEndStats): void {
    this.statisticsSubject.next(result);
  }

  public savePathLength(length: number): void {
    this.pathLengthSubject.next(length);
  }

}
