import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ROLES } from 'src/app/consts/consts';
import { Construction, FlightStartModel } from 'src/app/models/construction';
import { FlightEndStats, FlightStepResult, FlightUserResult } from 'src/app/models/flightStepResult.model';
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

  pathLength = 0;
  currentStep = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private statsService: StatisticsService,
    private flightHubService: FlightHubService) {}


  ngOnDestroy(): void {
    this.flightHubService.unsubscribeFromHub();

    this.subs.forEach(sub => {
      sub.unsubscribe();
    })
  }

  async ngOnInit(): Promise<void> {
    await this.flightHubService.startConnection();
    this.initListeners();

    console.log("ONInit");

    const routeSub = this.route.params.subscribe(async params => { 
      this.role = params['role'];

      if (!this.role) {
        this.router.navigate(['login/']);
        return;
      }

      

      const flightStartedSub = this.flightHubService.flightStarted$.subscribe((startModel: FlightStartModel) => this.flightStarted(startModel));
      const nextStepSub = this.flightHubService.stepCompleted$.subscribe((nextConstruction: Construction) => this.changeSteps(nextConstruction));
      const flightEndedSub = this.flightHubService.flightEnded$.subscribe((endStats: FlightEndStats) => this.endFlight(endStats));

      this.subs.push(flightStartedSub);
      this.subs.push(nextStepSub);
      this.subs.push(flightEndedSub);

      if (this.role === ROLES.PILOT) {
        this.userName = this.userService.getUserName();

        if (this.userName) {
          await this.flightHubService.pilotEntered(this.userName);
        }
      }

      if (this.role === ROLES.INSTRUCTOR) {

        const pathLengthSub = this.statsService.getPathLength$.subscribe(async length => {
          console.log('started', length);
          if(length > 0) {
            await this.flightHubService.startFlight(length);
          }
        });

        this.subs.push(pathLengthSub);

      }

    })

    this.subs.push(routeSub);
  }

  private endFlight(endStats: FlightEndStats) {
    this.statsService.saveStats(endStats);
    this.router.navigate(['statistics/']);
  }

  private initListeners() {
    this.flightHubService.initFlightEndedListener();
    this.flightHubService.initFlightStartedListener();
    this.flightHubService.initStepCompletedListener();
  }

  async makeStep() {
    if (this.role !== ROLES.PILOT || this.isLoading === true) {
      return;
    }

    this.isLoading = true;

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

    if(this.currentStep == this.pathLength) {
      await this.end();
    }

    this.flightHubService.getNextFlightConstructionStep();

  }

  private flightStarted(startModel: FlightStartModel){
    this.startTime = Date.now();
    this.isStarted = true;

    this.pathLength = startModel.length;
    this.steps.current = startModel.constructions[0];
    this.steps.next = startModel.constructions[1];

    this.drawMap();
  }

  private drawMap(): any {
    const map = document.getElementById("intMap1");

    if (map) {
      while (map.firstChild) {
        if(map.lastChild) {
          map.removeChild(map.lastChild);
        }
      }

      // if (this.steps.prev && this.steps.prev.y && this.steps.prev.x) {
      //   const prevObj = document.createElement('div');
      //   prevObj.style.cssText = `width: 20px; height: 20px; border-radius: 50%; background-color: green; position: absolute; top: ${+this.steps.prev.y-10}px; left: ${+this.steps.prev.x-10}px; color: white; padding-top: 10px;`;
      //   // currentObj.innerHTML = `${this.steps.current.name}`
      //   map.appendChild(prevObj);
      // }

      if (this.steps.current &&this.steps.current!.y && this.steps.current!.x) {
        const currentObj = document.createElement('div');
        currentObj.style.cssText = `width: 20px; height: 20px; background-color: red; position: absolute; top: ${+this.steps.current.y-10}px; left: ${+this.steps.current.x-10}px; color: white; padding-top: 10px; z-index:1;`;
        currentObj.classList.add('map-point');

        // currentObj.innerHTML = `${this.steps.current.name}`
        map.appendChild(currentObj);
      }

      if (this.steps.next && this.steps.next.y && this.steps.next.x) {
        const nextObj = document.createElement('div');
        nextObj.style.cssText = `width: 20px; height: 20px; background-color: yellow; position: absolute; top: ${+this.steps.next!.y-10}px; left: ${+this.steps.next!.x-10}px; color: white; padding-top: 10px;`;

        // nextObj.innerHTML = `${this.steps.next.name}`
        map.appendChild(nextObj);
      }
    
    }

  }

  private changeSteps(nextConstruction: Construction) {
    this.currentStep++;

    if (this.steps.next != undefined) {
      if (this.steps.current != undefined) {
        this.steps.prev = structuredClone(this.steps.current);
      }
      this.steps.current = structuredClone(this.steps.next);
      this.steps.next = this.currentStep >= this.pathLength ? undefined : structuredClone(nextConstruction);
    } else {
      this.steps.next = nextConstruction;
    }


    this.drawMap();

    this.isLoading = false;
  }

  public isLoading = false;

  public async end(): Promise<void> {
    this.isLoading = true;
    await this.flightHubService.endFlight({
      userName: this.userName!,
      results: this.stepResults
    });

    
  }

  get ROLES() {
    return ROLES;
  }

}
