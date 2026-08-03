import type { Message } from './messages';

/** 序列化：消息 → JSON 字符串 */
export function serialize(msg: Message): string {
    return JSON.stringify(msg);
}

/** 反序列化：JSON 字符串 → 消息 */
export function deserialize(data: string): Message {
    return JSON.parse(data) as Message;
}
