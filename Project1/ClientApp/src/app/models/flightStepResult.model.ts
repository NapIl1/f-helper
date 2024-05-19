export interface FlightStepResult {
    fromConstructionId?: string,
    toConstructionId: string
    time: number;
};

export interface FlightUserResult {
    userName: string,
    results: FlightStepResult[]
};