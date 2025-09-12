"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameReadyEvent = void 0;
const event_1 = require("../event");
class GameReadyEvent extends event_1.EventProcess {
    async init() {
        await super.init();
        this.eventTriggers = [
            "GameStartBefore" /* EventTriggers.GameStartBefore */,
            "AssignRoles" /* EventTriggers.AssignRoles */,
            "AdjustSeats" /* EventTriggers.AdjustSeats */,
            "ChooseGeneral" /* EventTriggers.ChooseGeneral */,
            "ChooseGeneralAfter" /* EventTriggers.ChooseGeneralAfter */,
            "InitProperty" /* EventTriggers.InitProperty */,
            "InitHandCard" /* EventTriggers.InitHandCard */,
            "GameStarted" /* EventTriggers.GameStarted */,
        ];
    }
}
exports.GameReadyEvent = GameReadyEvent;
