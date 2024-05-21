import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ROLES } from 'src/app/consts/consts';
import { Construction } from 'src/app/models/construction';
import { Point } from 'src/app/models/point.model';
import { FlightHubService } from 'src/app/services/flight-hub.service';
import { UserService } from 'src/app/services/user.service';
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

  userName: string = '';

  constructor(
    private userService: UserService,
    private router: Router){

  }
    
  async ngOnInit(): Promise<void> {
  }

  start() {
    this.userService.login(this.userName);
    this.router.navigate(['flight/' + ROLES.PILOT]);
  }

}


