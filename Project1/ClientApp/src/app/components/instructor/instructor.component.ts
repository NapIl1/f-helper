import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
export class InstructorComponent implements OnInit {

  id: string = '';
  name: string = '';
  description: string = '';
  number: number = 0;
  constructionType: string = '';
  isEnabled: boolean = true;
  color: string = '';
  constructionsId: string = ''

  points?: Construction[];


  constructor(
    private flightHubNotification: FlightHubService,
    private statsService: StatisticsService,
    private router: Router) {
  }

  async ngOnInit(): Promise<void> {
    await this.flightHubNotification.startConnection();
    // this.flightHubNotification.startAllSubscriptionsToHubEvents();
    this.points = await this.flightHubNotification.getConstructions();
    // this.flightHubNotification.flightStarteddNotificationEmitter.subscribe(x => this.test(x))
  }

  test(smth:any){
    console.log('test test test')
    //this.flightHubNotification.flightStarteddNotificationEmitter?.unsubscribe();
    
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
    await this.flightHubNotification.updateConstruction(this.points?.find(x => x.constructionId == this.editId));

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

    this.points.push(point);

    await this.flightHubNotification.addConstruction(point);
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

}
