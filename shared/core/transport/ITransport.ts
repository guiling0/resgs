import type { Message } from './types';

/** 传输层接口 */
export interface ITransport {
  send(msg: Message): void;

  /**
   * 注册消息处理器。
   * @returns 取消注册的函数
   */
  onMessage(handler: (msg: Message) => void): () => void;
}
