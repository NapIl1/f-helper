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

  bestResults: StatisticsItem[] = [ ];

  myResults: StatisticsItem[] = [];
  points: Construction[] = [];

  pointsCounted = 0;

  //get from stats
  pointsMy = 0;

  myTime = 0;

  constructor(
    private statsService: StatisticsService,
    private hubService: FlightHubService
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.hubService.startConnection();
    // const bestResults = await this.hubService.getStatistics();
    this.points = await this.hubService.getConstructions();

    // if (bestResults) {

    // }

    // console.log(bestResults);

    //get current flight stats
    this.statsService.getStatistics$.subscribe(stats => {
      console.log(stats);
      stats?.userResult.results.forEach(x => {

        this.myResults.push({
          pilotName: stats?.userResult.userName,
          arrivalTime: x.time,
          pointColor: this.points.find(p => p.constructionId == x.toConstructionId)?.color ?? '',
          pointName: this.points.find(p => p.constructionId == x.toConstructionId)?.number ?? 0
        });
        this.pointsMy++;
        
        this.myTime += x.time;

        var br = stats.bestResult.statistics.find(b => b.fromConstructionId === x.fromConstructionId && b.toConstructionId === x.toConstructionId);

        if(br) {
          this.pointsCounted++;
          this.bestResults.push({
            pilotName: br.bestUserNickName,
            arrivalTime: br.bestUserTime,
            pointColor: this.points.find(p => p.constructionId == x.toConstructionId)?.color ?? '',
            pointName: this.points.find(p => p.constructionId == x.toConstructionId)?.number ?? 0
          });
        } else {
          this.bestResults.push({
            pilotName: "",
            arrivalTime: null,
            pointColor: this.points.find(p => p.constructionId == x.toConstructionId)?.color ?? '',
            pointName: this.points.find(p => p.constructionId == x.toConstructionId)?.number ?? 0
          });
        }
        

      });

      // stats?.bestResult.statistics.forEach(x => {
      //   this.bestResults.push({
      //     pilotName: x.bestUserNickName,
      //     arrivalTime: x.bestUserTime,
      //     pointColor: this.points.find(p => p.constructionId == x.toConstructionId)?.color ?? '',
      //     pointName: this.points.find(p => p.constructionId == x.toConstructionId)?.number ?? 0
      //   });
      // });

    })


  }

  public saveResults() {
    
  }
}
