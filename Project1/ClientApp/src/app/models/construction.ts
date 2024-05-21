export interface Construction{
    id?: string,
    constructionId?: string,
    number?: number,
    name?: string,
    color?: string,
    description?: string,
    constructionType?: string,
    isEnabled?: boolean    
}

export interface FlightStartModel {
    length: number,
    constructions: Construction[]
};