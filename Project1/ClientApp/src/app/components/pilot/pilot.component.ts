import { Component, OnInit } from '@angular/core';
import { Point } from 'src/app/models/point.model';
import { v4 as uuidv4 } from 'uuid';

export interface PointResult {
  point: Point,
  difference: number
}

@Component({
  selector: 'app-pilot',
  templateUrl: './pilot.component.html',
  styleUrls: ['./pilot.component.scss']
})
export class PilotComponent implements OnInit {

  nickname: string = '';

  points: Point[] = [{
    id: uuidv4(),
    name: 'name1',
    color: 'red',
    number: 2,
    bestResultPilot: 'vasyan',
    bestResultTime: 10000
  },
  {
    id: uuidv4(),
    name: 'name1',
    color: 'blue',
    number: 2,
    bestResultPilot: 'vasyan',
    bestResultTime: 1000
  },
  {
    id: uuidv4(),
    name: 'name3',
    color: 'green',
    number: 3,
    bestResultPilot: 'vasyan',
    bestResultTime: 2000
  }];

  selectedPoint?: Point = undefined;

  now = Date.now();
  isFinished = false;

  ngOnInit(): void {
    this.selectedPoint = this.points[Math.floor(Math.random() * this.points.length)];
  }

  path: any[] = [

  ];

  result: PointResult[] = []

  total = 0;
  totalMy = 0;
  totalDiff = 0;

  pointCompleted() {

    this.path.push({
      pointId: this.selectedPoint!.id,
      time: Date.now() - this.now
    });
   

    if(this.path.length >=3) {
      this.isFinished = true;

      this.path.forEach(p => {
        const point = this.points.find(x => p.pointId == x.id);
        console.log(point);
        this.result.push({
          point: point!,
          difference: p.time - point!.bestResultTime!
        });
        this.total += point?.bestResultTime!;
        this.totalMy += p.time;
      })

      this.totalDiff = this.totalMy - this.total;

      // this.result.push (...this.path.map(x => !))
      
    }
    this.selectedPoint = this.points[Math.floor(Math.random() * this.points.length)];
    console.log(this.path);

    //
  }

  calculateTime(point: Point) {
    return this.path.find(x => x.pointId == point.id).time - (point.bestResultTime ?? 0);
  }

}


