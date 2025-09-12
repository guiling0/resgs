export const enum ServerCode {
    Success = 200,
    IsLogined = 501,
    UsernameOrPasswordError = 502,
    AuthError = 503,
    AlreadyJoined = 504,
    RoomIsStarted = 505,
    PasswordError = 506,
    PlayerCountMax = 507,
    ProhibitStand = 508,
    NotTester = 509,
    AccountIsBanGame = 510,
}

export const enum GameState {
    Wating,
    Gaming,
    Ending,
}
