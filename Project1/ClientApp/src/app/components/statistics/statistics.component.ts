import { Component, OnInit } from '@angular/core';
import { Construction } from 'src/app/models/construction';
import { Point } from 'src/app/models/point.model';
import { FlightHubService } from 'src/app/services/flight-hub.service';
import { StatisticsService } from 'src/app/services/statistics.service';
import { v4 as uuidv4 } from 'uuid';

export interface StatisticsItem {
  pointName: number,
  pointColor: string,
  arrivalTime: number | null,
  pilotName: string
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  bestResults: StatisticsItem[] = [
    {
      pointName: 1,
      pointColor: 'r',
      arrivalTime: null,
      pilotName: 'Vasyan'
    },
    {
      pointName: 2,
      pointColor: 'g',
      arrivalTime: 1000,
      pilotName: 'Vasyan'
    },
    {
      pointName: 3,
      pointColor: 'r',
      arrivalTime: 1500,
      pilotName: 'Vasyan'
    },
    {
      pointName: 4,
      pointColor: 'g',
      arrivalTime: 2500,
      pilotName: 'Vasyan'
    }
  ];

  myResults: StatisticsItem[] = [];
  points: Construction[] = [];

  pointsCounted = 0;

  //get from stats
  pointsMy = 8;

  myTime = 0;

  constructor(
    private statsService: StatisticsService,
    private hubService: FlightHubService
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.hubService.startConnection();
    const bestResults = await this.hubService.getStatistics();
    this.points = await this.hubService.getConstructions();

    if (bestResults) {

    }

    console.log(bestResults);

    //get current flight stats
    this.statsService.getStatistics$.subscribe(stats => {
      console.log(stats);
      stats?.results.forEach(x => {

        this.myResults.push({
          pilotName: stats.userName,
          arrivalTime: x.time,
          pointColor: this.points.find(p => p.constructionId == x.toConstructionId)?.color ?? '',
          pointName: this.points.find(p => p.constructionId == x.toConstructionId)?.number ?? 0
        });

        this.pointsCounted++;
        this.myTime += x.time;

      })

    })
  }

  public saveResults() {
    
  }
}
