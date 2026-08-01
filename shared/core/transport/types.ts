/** 消息体 */
export type MessageData = Record<string, unknown>;

/** 消息信封 */
export interface Message {
  /** 消息序号（每个方向独立递增，兼顾丢包/gap 检测） */
  msgId: number;
  /** 房间ID */
  roomId: string;
  /** 时间戳 */
  time: number;
  /** 消息体 */
  data: MessageData;
}
