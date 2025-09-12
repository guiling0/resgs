import { EventProcess } from '../event';
import { EventTriggers } from '../triggers';

export class GameReadyEvent extends EventProcess {
    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [
            EventTriggers.GameStartBefore,
            EventTriggers.AssignRoles,
            EventTriggers.AdjustSeats,
            EventTriggers.ChooseGeneral,
            EventTriggers.ChooseGeneralAfter,
            EventTriggers.InitProperty,
            EventTriggers.InitHandCard,
            EventTriggers.GameStarted,
        ];
    }
}
