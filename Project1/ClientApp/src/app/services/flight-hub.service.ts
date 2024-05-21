import { Injectable, Output, EventEmitter } from "@angular/core";
import { API_URL } from "../consts/consts";
import * as signalR from "@aspnet/signalr";
import { Construction, FlightStartModel } from "../models/construction";
import { ConstructionResponse } from "../models/constructions.hub.response";
import { BehaviorSubject, Subject } from "rxjs";
import { FlightEndStats, FlightUserResult } from "../models/flightStepResult.model";

@Injectable({
    providedIn: 'root'
})
export class FlightHubService {
    private stepCompletedSubject = new Subject<Construction>();
    private flightStartedSubject = new Subject<FlightStartModel>();
    private flightEndedSubject = new Subject<FlightEndStats>();
    private pilotEnteredSubject = new Subject<string>();

    public stepCompleted$ = this.stepCompletedSubject.asObservable();
    public flightStarted$ = this.flightStartedSubject.asObservable();
    public flightEnded$ = this.flightEndedSubject.asObservable();
    public pilotEntered$ = this.pilotEnteredSubject.asObservable();

    private readonly FLIGHT_HUB_NAME = API_URL + "flightNotification";
    private hubConnection?: signalR.HubConnection;

    private isInit = false;

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

    public async closeConnection(): Promise<void> {
        await this.hubConnection?.stop();
        this.hubConnection = undefined;
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
    public async startFlight(length: number) : Promise<void>{
        await this.hubConnection?.invoke('FlightStartedNotification', length);
    }

    public async endFlight(userResult: FlightUserResult) : Promise<void>{
        await this.hubConnection?.invoke('FlightEndedNotification', userResult);
    }

    public async getNextFlightConstructionStep() {
        var res = await this.hubConnection?.invoke('GetNextStepNotification');
    }

    public async pilotEntered(userName: string) {
        await this.hubConnection?.invoke('PilotEnteredNotification', userName);
    }

    //#endregion
    //#region statistics
    public async getStatistics() {
        var res = await this.hubConnection?.invoke('GetStatistics');
        console.log(res);
        return res;
    }
    //#endregion

    public unsubscribeFromHub() {
        this.hubConnection?.off('GetNextStepNotification');
        this.hubConnection?.off('FlightStartedNotification');
        this.hubConnection?.off('FlightEndedNotification');
        this.hubConnection?.off('PilotEnteredNotification');
    }

    public initPilotEnteredListener(): void {
        this.hubConnection?.on('PilotEnteredNotification', (pilotName: string) => {
            this.pilotEnteredSubject.next(pilotName);
        });
    }

    public initStepCompletedListener(): void {
        this.hubConnection?.on('GetNextStepNotification', (nextConstruction: Construction) => {
            this.stepCompletedSubject.next(nextConstruction);
        });
    }

    public initFlightStartedListener(): void {
        this.hubConnection?.on('FlightStartedNotification', (startModel: FlightStartModel) => {
            this.flightStartedSubject.next(startModel);
        });
    }

    public initFlightEndedListener(): void {
        this.hubConnection?.on('FlightEndedNotification', (endStats: FlightEndStats) => {
            this.flightEndedSubject.next(endStats);
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