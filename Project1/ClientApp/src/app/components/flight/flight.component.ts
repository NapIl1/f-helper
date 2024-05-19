import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ROLES } from 'src/app/consts/consts';
import { Construction } from 'src/app/models/construction';
import { FlightStepResult, FlightUserResult } from 'src/app/models/flightStepResult.model';
import { FlightHubService } from 'src/app/services/flight-hub.service';
import { StatisticsService } from 'src/app/services/statistics.service';
import { UserService } from 'src/app/services/user.service';

export interface Steps {
  prev?: Construction,
  current?: Construction,
  next?: Construction
}

@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss']
})
export class FlightComponent implements OnInit, OnDestroy {

  subs: Subscription[] = [];
  nextStepSub: Subscription | null = null;
  flightStartedSub: Subscription | null = null;
  role?: string;

  isFirstStep = true;
  steps: Steps = {};

  stepResults: FlightStepResult[] = [];
  startTime: number = 0;
  isStarted = false;

  userName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private statsService: StatisticsService,
    private flightHubService: FlightHubService) {}


  ngOnDestroy(): void {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    })
  }

  async ngOnInit(): Promise<void> {
    await this.flightHubService.startConnection();
    this.initListeners();

    const routeSub = this.route.params.subscribe(async params => { 
      this.role = params['role'];

      if (!this.role) {
        this.router.navigate(['login/']);
        return;
      }

      if (this.role === ROLES.PILOT) {
        this.userName = this.userService.getUserName();
      }

      const flightStartedSub = this.flightHubService.flightStarted$.subscribe((constructions: Construction[]) => this.flightStarted(constructions));
      const nextStepSub = this.flightHubService.stepCompleted$.subscribe((nextConstruction: Construction) => this.changeSteps(nextConstruction));
      const flightEndedSub = this.flightHubService.flightEnded$.subscribe((userResults: FlightUserResult) => this.endFlight(userResults));

      this.subs.push(flightStartedSub);
      this.subs.push(nextStepSub);
      this.subs.push(flightEndedSub);

      if (this.role === ROLES.INSTRUCTOR) {
        await this.flightHubService.startFlight();
      }

    })

    this.subs.push(routeSub);
  }

  private endFlight(userResults: FlightUserResult) {
    this.statsService.saveStats(userResults);
    this.router.navigate(['statistics/']);
  }

  private initListeners() {
    this.flightHubService.initFlightEndedListener();
    this.flightHubService.initFlightStartedListener();
    this.flightHubService.initStepCompletedListener();
  }

  makeStep() {
    if (this.role !== ROLES.PILOT) {
      return;
    }

    const time = Date.now();

    if(this.isFirstStep === true) {
      this.isFirstStep = false;
      
    } else {
      this.stepResults.push(
        {
          time: time - this.startTime,
          fromConstructionId: this.steps.prev?.constructionId,
          toConstructionId: this.steps.current?.constructionId! 
        }
      )

      console.log(this.stepResults);
    }

    this.startTime = time;

    this.flightHubService.getNextFlightConstructionStep();
  }

  private flightStarted(constructions: Construction[]){
    this.startTime = Date.now();
    this.isStarted = true;

    this.steps.current = constructions[0];
    this.steps.next = constructions[1];
  }

  private changeSteps(nextConstruction: Construction) {
    if (this.steps.next != undefined) {
      if (this.steps.current != undefined) {
        this.steps.prev = structuredClone(this.steps.current);
      }
      this.steps.current = structuredClone(this.steps.next);
      this.steps.next = structuredClone(nextConstruction);
    } else {
      this.steps.next = nextConstruction;
    }
  }

  public async end(): Promise<void> {
    await this.flightHubService.endFlight({
      userName: this.userName!,
      results: this.stepResults
    });

    
  }

  get ROLES() {
    return ROLES;
  }

}
