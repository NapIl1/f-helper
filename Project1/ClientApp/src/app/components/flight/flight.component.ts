import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ROLES } from 'src/app/consts/consts';

@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss']
})
export class FlightComponent implements OnInit, OnDestroy {

  sub: Subscription | null = null;
  role?: string;

  isFirstStep = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => { 
      this.role = params['role'];

      console.log(this.role);

      if (!this.role) {
        this.router.navigate(['login/']);
      }


    })

  }

  end() {
    this.router.navigate(['statistics/']);
  }

  get ROLES() {
    return ROLES;
  }

}
