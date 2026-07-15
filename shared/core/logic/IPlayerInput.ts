export interface IPlayerInput {
    requestChoice(playerId: string, options: any): Promise<any>;
}
