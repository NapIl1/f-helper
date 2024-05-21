import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class StatisticsComponent implements OnInit, OnDestroy {

  bestResults: StatisticsItem[] = [ ];

  myResults: StatisticsItem[] = [];
  points: Construction[] = [];

  pointsCounted = 0;

  //get from stats
  pointsMy = 0;

  myTime = 0;
  bestTime = 0;
  timeDifference = 0;

  subs: Subscription[] = [];

  constructor(
    private statsService: StatisticsService,
    private router: Router,
    private hubService: FlightHubService
  ) {
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    })
  }

  async ngOnInit(): Promise<void> {
    await this.hubService.startConnection();
    // const bestResults = await this.hubService.getStatistics();
    this.points = await this.hubService.getConstructions();

    const statsSub = this.statsService.getStatistics$.subscribe(stats => {
      if(!stats) {
        return;
      }

      // Push the first point
      this.myResults.push({
        pilotName: "",
        arrivalTime: null,
        pointColor: this.points.find(p => p.constructionId == stats?.userResult.results[0].fromConstructionId)?.color ?? '',
        pointName: this.points.find(p => p.constructionId == stats?.userResult.results[0].fromConstructionId)?.number ?? 0
      });

      this.bestResults.push({
        pilotName: "",
        arrivalTime: null,
        pointColor: this.points.find(p => p.constructionId == stats?.userResult.results[0].fromConstructionId)?.color ?? '',
        pointName: this.points.find(p => p.constructionId == stats?.userResult.results[0].fromConstructionId)?.number ?? 0
      });

      stats?.userResult.results.forEach(x => {
        this.myResults.push({
          pilotName: stats?.userResult.userName,
          arrivalTime: x.time,
          pointColor: this.points.find(p => p.constructionId == x.toConstructionId)?.color ?? '',
          pointName: this.points.find(p => p.constructionId == x.toConstructionId)?.number ?? 0
        });

        this.pointsMy++;
        
       

        var br = stats.bestResult.statistics.find(b => b.fromConstructionId === x.fromConstructionId && b.toConstructionId === x.toConstructionId);

        if(br) {
          this.pointsCounted++;
          this.myTime += x.time;
          this.bestTime += br.bestUserTime;
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

    });

    this.subs.push(statsSub);

    this.timeDifference = this.myTime - this.bestTime;
  }

  public endFlight() {
    this.hubService.closeConnection();
    this.router.navigate(['']);
  }
}
