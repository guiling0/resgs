import type { RoomOptions } from './RoomOptions';

export class Room {
  roomId: string;
  options: RoomOptions;
  mode: string = 'default';

  constructor(roomId: string, options: RoomOptions) {
    this.roomId = roomId;
    this.options = options;
  }
}
