import type { Message } from './types';

export function serialize(msg: Message): string {
  return JSON.stringify(msg);
}

export function deserialize(data: string): Message {
  return JSON.parse(data) as Message;
}
