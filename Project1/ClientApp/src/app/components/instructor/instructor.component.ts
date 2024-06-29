import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ROLES } from 'src/app/consts/consts';
import { Construction } from 'src/app/models/construction';
import { Point } from 'src/app/models/point.model';
import { FlightHubService } from 'src/app/services/flight-hub.service';
import { StatisticsService } from 'src/app/services/statistics.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.scss']
})
export class InstructorComponent implements OnInit, OnDestroy {

  id: string = '';
  name: string = '';
  description: string = '';
  number: number = 0;
  constructionType: string = '';
  isEnabled: boolean = true;
  color: string = '';
  constructionsId: string = ''

  points?: Construction[];

  pilotName?: string;

  subs: Subscription[] = [];

  constructor(
    private flightHubNotification: FlightHubService,
    private statsService: StatisticsService,
    private router: Router) {
  }

  ngOnDestroy(): void {
    this.flightHubNotification.unsubscribeFromHub();

    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }

  async ngOnInit(): Promise<void> {
    await this.flightHubNotification.startConnection();
    this.points = await this.flightHubNotification.getConstructions();
    this.drawPoints();

    this.flightHubNotification.initPilotEnteredListener();
    this.flightHubNotification.pilotEntered$.subscribe(pilotName => {
      this.pilotName = pilotName;
    })

  }

  isSettingsOpened = true;

  editId = '';

  async openSettings() {
    this.isSettingsOpened = !this.isSettingsOpened;
  }

  enterEditMode(pointId: string | undefined) {
    this.editId = pointId ?? '';
  }

  async savePoint(id: string | undefined) {
    const point = this.points?.find(x => x.constructionId == this.editId);
    if (point && this.pointX && this.pointY) {
      point.x = this.pointX;
      point.y = this.pointY;

      const sameIdPoints =  this.points?.filter(x => x.name == point.name && x.constructionId != point.constructionId);

      sameIdPoints?.forEach(p => {
        p.x = point.x;
        p.y = point.y;
      });
    }

   
    await this.flightHubNotification.updateConstruction(point);
    

    this.deleteAllPoints();
    this.drawPoints();

    this.editId = '';
  }

  async addPoint() {
    if(this.points == undefined){
      this.points = [];
    }

    const point: Construction = {
      constructionId: uuidv4(),
      color: this.color,
      name: this.name,
      number: this.number,
      constructionType: this.constructionType,
      description: this.description,
      isEnabled: true,
    };

    if (this.pointX && this.pointY && this.pointObj) {
      point.x = this.pointX;
      point.y = this.pointY;

      const sameIdPoints =  this.points?.filter(x => x.name == point.name && x.constructionId != point.constructionId);

      sameIdPoints?.forEach(p => {
        p.x = point.x;
        p.y = point.y;
      });
    } else {
      alert("Виберіть точку на мапі");
      return;
    }

    this.points.push(point);

    await this.flightHubNotification.addConstruction(point);

    this.deleteAllPoints();
    this.drawPoints();
    this.color = '';
    this.name = ''
    this.number = 0;
    this.constructionType = '';
    this.description = '';
    this.pointX = undefined;
    this.pointY = undefined;
    this.pointObj = undefined;
    this.isCopy = false;
  }
  // START

  isStarted = false;

  selectedPoint?: Point = undefined;
  pathLength: number = 0;


  async start() {
    this.isStarted = true;
    this.isSettingsOpened = false;
    // await this.flightHubNotification.startFlight();


    if (this.pathLength > 0) {
      this.statsService.savePathLength(this.pathLength);
      this.router.navigate(['flight/' + ROLES.INSTRUCTOR]);
    }


  }

  setPathLenght() {
    console.log("terter");
  }

  isCopy = false;

  makeCopy(point: Construction): void {
    this.color = point.color!;
    this.name = point.name!;
    this.number = point.number!;
    this.constructionType = point.constructionType!;
    this.description = point.description!;
    this.pointX = point.x;
    this.pointY = point.y;
    this.pointObj = {};
    this.isCopy = true;
  }

  pointX?: string = undefined;
  pointY?: string = undefined;
  pointObj: any = null;

  private deleteSelectedPoint(): void {
    const map = document.getElementById("intMap");

    if (map) {

      if(this.pointObj && !this.isCopy) {
        map.removeChild(this.pointObj);
        this.pointX = undefined;
        this.pointY = undefined;
      }
    }
  }

  private deleteAllPoints():void {
    const map = document.getElementById("intMap");

    if (map) {
      while (map.firstChild) {

        if(map.lastChild) {
          map.removeChild(map.lastChild);
        }
      }
    }

    this.pointObj = undefined;
    
  }

  private drawPoints():void {
    const map = document.getElementById("intMap");

    const pastNames: string[] = [];

    if (map) {
      this.points?.forEach(p => {
        if(p.x && p.y && !pastNames.includes(p.name!)) {

          const pObj = document.createElement('div');
          pObj.style.cssText = `width: 10px; height: 10px; background-color: red; position: absolute; top: ${+p.y-5}px; left: ${+p.x-5}px; color: white; padding-top: 10px;`;
          pObj.innerHTML = `${p.name}`
          map.appendChild(pObj);

          pastNames.push(p.name!);
        }
      });
    }

    
  }

  selectPoint(event: any) {
    const map = document.getElementById("intMap");

    if (map) {

      this.deleteSelectedPoint();

      var rect = map?.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      this.pointObj = document.createElement('div');
      this.pointObj.style.cssText = `width: 10px; height: 10px; border-radius: 50%; background-color: yellow; position: absolute; top: ${y-5}px; left: ${x-5}px`;
      map.appendChild(this.pointObj);

      this.pointX = x.toString();
      this.pointY = y.toString();
    }
  }

  private getRandomColor():string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

}
