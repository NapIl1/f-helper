import { Injectable, Output, EventEmitter } from "@angular/core";
import { API_URL } from "../consts/consts";
import * as signalR from "@aspnet/signalr";
import { Construction } from "../models/construction";
import { ConstructionResponse } from "../models/constructions.hub.response";
import { BehaviorSubject, Subject } from "rxjs";
import { FlightUserResult } from "../models/flightStepResult.model";

@Injectable({
    providedIn: 'root'
})
export class FlightHubService {
    private stepCompletedSubject = new Subject<Construction>();
    private flightStartedSubject = new Subject<Construction[]>();
    private flightEndedSubject = new Subject<FlightUserResult>();

    public stepCompleted$ = this.stepCompletedSubject.asObservable();
    public flightStarted$ = this.flightStartedSubject.asObservable();
    public flightEnded$ = this.flightEndedSubject.asObservable();

    private readonly FLIGHT_HUB_NAME = API_URL + "flightNotification";
    private hubConnection?: signalR.HubConnection;

    constructor() {
    }

    public async startConnection(): Promise<void> {
        if (!this.hubConnection){
            this.hubConnection = new signalR.HubConnectionBuilder()
                .withUrl(this.FLIGHT_HUB_NAME)
                .build();

            await this.hubConnection.start()
                .then(() => console.log('Connection started'))
                .catch(err => console.log('Error while starting connection: ' + err))
        }
    }

    //#region constructions
    public async getConstructions(): Promise<Construction[]> {
        var res = await this.hubConnection?.invoke('GetAllConstructions');
        return res ?? [];
    }

    public async addConstruction(construction: Construction | undefined) : Promise<void>{
        await this.hubConnection?.invoke('AddConstruction',construction);
    }

    public async updateConstruction(construction: Construction | undefined) : Promise<void>{
        await this.hubConnection?.invoke('UpdateConstruction',construction);
    }
    //#endregion

    //#region flight actions
    public async startFlight() : Promise<void>{
        await this.hubConnection?.invoke('FlightStartedNotification')
    }

    public async endFlight(userResult: FlightUserResult) : Promise<void>{
        await this.hubConnection?.invoke('FlightEndedNotification', userResult);
    }

    public async getNextFlightConstructionStep() {
        var res = await this.hubConnection?.invoke('GetNextStepNotification');
        console.log(res);
    }

    //#endregion

    //#region statistics
    public async getStatistics() {
        var res = await this.hubConnection?.invoke('GetStatistics');
        console.log(res);
        return res;
    }
    //#endregion

    public initStepCompletedListener(): void {
        this.hubConnection?.on('GetNextStepNotification', (nextConstruction: Construction) => {
            this.stepCompletedSubject.next(nextConstruction);
        });
    }

    public initFlightStartedListener(): void {
        this.hubConnection?.on('FlightStartedNotification', (constructions: Construction[]) => {
            this.flightStartedSubject.next(constructions);
        });
    }

    public initFlightEndedListener(): void {
        this.hubConnection?.on('FlightEndedNotification', (result: FlightUserResult) => {
            this.flightEndedSubject.next(result);
        });
    }

    //#region Events
    // public startAllSubscriptionsToHubEvents(){
    //     this.nextConstructionEventListener();
    //     this.flightStartedEventListener();
    //     this.flightEndedEventListener();
    // }

    // public nextConstructionEventListener() {
    //     console.log('nextConstructionEventListener');
    //     if(this.hubConnection == undefined){
    //         return;
    //     }

    //     this.hubConnection.on('GetNextStepNotification', (nextConstruction: any) => {
    //         console.log('next step triggered')
    //         this.stepCompletedNotificationEmitter.emit(nextConstruction);
    //     });
    // };

    // public flightStartedEventListener() {
    //     console.log('flightStartedEventListener');
    //     if(this.hubConnection == undefined){
    //         return;
    //     }

    //     this.hubConnection.on('FlightStartedNotification', (constructions: Construction[]) => {
    //         this.flightStarteddNotificationEmitter.emit(constructions);
    //     });
    // };

    // public flightEndedEventListener() {
    //     console.log('flightEndedEventListener');
    //     if(this.hubConnection == undefined){
    //         return;
    //     }

    //     this.hubConnection.on('FlightEndedNotification', (nextConstruction:any) => {
    //         this.flightEndeddNotificationEmitter.emit(nextConstruction);
    //     });
    // };
    //#endregion
}