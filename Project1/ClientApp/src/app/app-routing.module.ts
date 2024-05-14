import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InstructorComponent } from './components/instructor/instructor.component';
import { PilotComponent } from './components/pilot/pilot.component';
import { FlightComponent } from './components/flight/flight.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

const routes: Routes = [{
  path: '',
  component: LoginComponent,
}, {
  path: 'instructor',
  component: InstructorComponent,
}, {
  path: 'pilot',
  component: PilotComponent,
}, {
  path: 'flight/:role',
  component: FlightComponent,
}, {
  path: 'statistics',
  component: StatisticsComponent,
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
