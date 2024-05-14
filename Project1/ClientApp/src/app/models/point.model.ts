export interface Point {
    id: string,
    name: string,
    color: string,
    number: number,
    bestResultTime?: number // ms
    bestResultPilot?: string
}