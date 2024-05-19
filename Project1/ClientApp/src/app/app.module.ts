import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { InstructorComponent } from './components/instructor/instructor.component';
import { FormsModule } from '@angular/forms';
import { PilotComponent } from './components/pilot/pilot.component';
import { FlightComponent } from './components/flight/flight.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { FlightHubService } from './services/flight-hub.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    InstructorComponent,
    PilotComponent,
    FlightComponent,
    StatisticsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [FlightHubService],
  bootstrap: [AppComponent]
})
export class AppModule { }
