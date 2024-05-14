import { Injectable, Output, EventEmitter } from "@angular/core";
import { API_URL } from "../consts/consts";
import * as signalR from "@aspnet/signalr";
import { Construction } from "../models/construction";
import { ConstructionResponse } from "../models/constructions.hub.response";

@Injectable({
    providedIn: 'root'
})
export class FlightHubService {
    @Output() public stepCompletedNotification = new EventEmitter<any>();
    private readonly FLIGHT_HUB_NAME = API_URL + "flightNotification";
    private hubConnection?: signalR.HubConnection;

    constructor(){
        this.nextConstruction();
    }

    public async startConnection(): Promise<void> {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.FLIGHT_HUB_NAME)
            .build();

        await this.hubConnection
            .start()
            .then(() => console.log('Connection started'))
            .catch(err => console.log('Error while starting connection: ' + err))
    }

    public async updateConstruction(constructions: Construction[] | undefined, constructionListId: string) : Promise<void>{
        var recordJson = {
            id: constructionListId,
            constructions
        };

        await this.hubConnection?.invoke('UpdateConstruction', recordJson);
    }

    public async getNextStepNotification() {
        var res = await this.hubConnection?.invoke('GetNextStepNotification');
        console.log(res);
    }

    public async getStatistics() {
        var res = await this.hubConnection?.invoke('GetStatistics');
        console.log(res);
    }

    public async getConstructions(): Promise<ConstructionResponse> {
        var res = await this.hubConnection?.invoke('GetAllConstructions');
        return res[0] ?? [];
    }

    public nextConstruction() {
        this.hubConnection?.on('GetNextStepNotification1', (nextConstruction) => {
            this.stepCompletedNotification.emit(nextConstruction);
        });
    };
}