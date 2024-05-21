export interface FlightStepResult {
    fromConstructionId?: string,
    toConstructionId: string
    time: number;
};

export interface FlightUserResult {
    userName: string,
    results: FlightStepResult[]
};

export interface BestResult {
    statistics: {
        statisticId: string,
        fromConstructionId: string,
        toConstructionId: string,
        bestUserNickName: string,
        bestUserTime: number
    } [];
};

export interface FlightEndStats { 
    bestResult: BestResult,
    userResult: FlightUserResult
}