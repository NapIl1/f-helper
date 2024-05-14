import { Component } from '@angular/core';
import { Point } from 'src/app/models/point.model';
import { v4 as uuidv4 } from 'uuid';

export interface StatisticsItem {
  pointName: string,
  pointColor: string,
  arrivalTime: number | null,
  pilotName: string
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {

  bestResults: StatisticsItem[] = [
    {
      pointName: '1',
      pointColor: 'r',
      arrivalTime: null,
      pilotName: 'Vasyan'
    },
    {
      pointName: '2',
      pointColor: 'g',
      arrivalTime: 1000,
      pilotName: 'Vasyan'
    },
    {
      pointName: '3',
      pointColor: 'r',
      arrivalTime: 1500,
      pilotName: 'Vasyan'
    },
    {
      pointName: '4',
      pointColor: 'g',
      arrivalTime: 2500,
      pilotName: 'Vasyan'
    }
  ];

  myResults: StatisticsItem[] = [];

  pointsCounted = 7;
  pointsMy = 8;

  constructor() {

    // this.bestResults.push(...this.bestResults);
    // this.bestResults.push(...this.bestResults);
    // this.bestResults.push(...this.bestResults);

    this.myResults = this.bestResults;
  }
}
