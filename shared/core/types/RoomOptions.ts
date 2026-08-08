export interface RoomOptions {
  responseTime: number;
  spectate?: boolean;
  /** 游戏模式（startGame 时从 sgs.modes 获取） */
  mode?: string;
}
