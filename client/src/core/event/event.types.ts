import { EventData } from './data';

export type EventId = number;

export type HandleData<T extends EventData> =
    | T
    | ({
          [key in keyof T]?: T[key];
      } & {
          source: EventData;
          reason: string;
      });

export const enum DamageType {
    None = 0,
    Fire,
    Thunder,
}
