import type { StatePatch } from '../state/StateTypes';

/** 业务消息类型常量（Envelope 路由判别符，与 EnvelopePayload 联合成员对应） */
export enum MessageType {
    None = 'none',
}

/** 业务消息体联合（判别联合；成员带 type 判别符，Envelope.data 使用） */
export type EnvelopePayload =
    | { type: MessageType.None };

/** 业务消息信封：{type: 业务类型, id: 序号, data: 消息体} */
export interface Envelope {
    /** 业务消息类型（判别符） */
    type: MessageType | (string & {});
    /** 消息序号 */
    id: number;
    /** 消息体 */
    data: EnvelopePayload;
}

/**
 * 传输消息联合（host↔client 通道消息）：snapshot / patches / event / batch。
 * batch 为事务批次产物，一条消息携带混合载荷（patches + events）。
 */
export type Message =
    | { kind: 'snapshot'; seq: number; state: unknown }
    | { kind: 'patches'; seq: number; patches: StatePatch[] }
    | { kind: 'event'; seq: number; event: Envelope }
    | { kind: 'batch'; seq: number; patches?: StatePatch[]; events?: Envelope[] };
