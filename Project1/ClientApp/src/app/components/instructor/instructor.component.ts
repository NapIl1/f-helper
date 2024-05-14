import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ROLES } from 'src/app/consts/consts';
import { Construction } from 'src/app/models/construction';
import { Point } from 'src/app/models/point.model';
import { FlightHubService } from 'src/app/services/flight-hub.service';
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
    private router: Router) {
  }

  async ngOnInit(): Promise<void> {
    await this.flightHubNotification.startConnection();
    // this.flightHubNotification.nextConstruction();
    const result = await this.flightHubNotification.getConstructions();
    console.log(result)
    this.points = result.constructions;
    this.constructionsId = result._id;
    this.flightHubNotification.stepCompletedNotification.subscribe(x => this.test(x))
  }

  test(smth:any){
    console.log(smth)
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
    // console.log('savePoint');
    // var res = await this.flightHubNotification.getNextStepNotification();
    // console.log(res);
    // // this.http.put()
    this.editId = '';

    await this.flightHubNotification.updateConstruction(this.points, this.constructionsId);
  }

  async addPoint() {
    if(this.points == undefined){
      this.points = [];
    }

    this.points.push({
      id: uuidv4(),
      isEnabled: this.isEnabled,
      color: this.color,
      name: this.name,
      number: this.number,
      constructionType: this.constructionType,
      description: this.description,
    })

    await this.flightHubNotification.updateConstruction(this.points, this.constructionsId);
  }

  // START

  isStarted = false;

  selectedPoint?: Point = undefined;
  pathLength: number = 0;


  start() {
    this.isStarted = true;
    this.isSettingsOpened = false;
    // this.http.post()
    // alert('Started!');
    this.router.navigate(['flight/' + ROLES.INSTRUCTOR]);

    //this.selectedPoint = this.points[Math.floor(Math.random() * this.points.length)];

  }

  setPathLenght() {
    console.log("terter");

  }

}
