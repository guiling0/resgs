/**
 * 全局配置。
 */

// ===== 服务器 =====

export const SERVER_CONFIG = {
    host: '127.0.0.1',
    port: 12699,
    get wsUrl(): string {
        return `ws://${this.host}:${this.port}`;
    },
    get httpUrl(): string {
        return `http://${this.host}:${this.port}`;
    },
};

// ===== CDN =====

/** CDN 资源根地址（后续接入真实 CDN 时启用） */
export const CDN_BASE = 'http://res.resgs.com';

// ===== 座位布局 =====

type SeatPosition = { x: number; y: number; scale: number };

export const TABLE_SEAT_POSITIONS: Record<string, SeatPosition[]> = {
    default: [
        { x: 0, y: 0, scale: 0.8 },
        { x: 258, y: 0, scale: 0.8 },
        { x: 517, y: 0, scale: 0.8 },
        { x: 775, y: 0, scale: 0.8 },
        { x: 0, y: 353, scale: 0.8 },
        { x: 258, y: 353, scale: 0.8 },
        { x: 517, y: 353, scale: 0.8 },
        { x: 775, y: 353, scale: 0.8 },
        { x: 0, y: 706, scale: 0.8 },
        { x: 258, y: 706, scale: 0.8 },
        { x: 517, y: 706, scale: 0.8 },
        { x: 775, y: 706, scale: 0.8 },
    ],
};

/** 座位坐标（设计分辨率 1920×1080）。仅包含其他玩家座位，自己座位见 SELF_SEAT_POS */
export const SEAT_POSITIONS: Record<number, SeatPosition[]> = {
    2: [{ x: 959, y: 150, scale: 1.5 }],
    3: [
        { x: 1261, y: 150, scale: 1.5 },
        { x: 604, y: 150, scale: 1.5 },
    ],
    4: [
        { x: 1763, y: 500, scale: 1.5 },
        { x: 959, y: 150, scale: 1.5 },
        { x: 130, y: 500, scale: 1.5 },
    ],
    5: [
        { x: 1763, y: 500, scale: 1.5 },
        { x: 1261, y: 150, scale: 1.5 },
        { x: 604, y: 150, scale: 1.5 },
        { x: 130, y: 500, scale: 1.5 },
    ],
    6: [
        { x: 1763, y: 500, scale: 1.5 },
        { x: 1411, y: 150, scale: 1.5 },
        { x: 954, y: 150, scale: 1.5 },
        { x: 497, y: 150, scale: 1.5 },
        { x: 130, y: 500, scale: 1.5 },
    ],
    7: [
        { x: 1763, y: 500, scale: 1.5 },
        { x: 1458, y: 150, scale: 1.5 },
        { x: 1111, y: 150, scale: 1.5 },
        { x: 764, y: 150, scale: 1.5 },
        { x: 417, y: 150, scale: 1.5 },
        { x: 130, y: 500, scale: 1.5 },
    ],
    8: [
        { x: 1763, y: 500, scale: 1.5 },
        { x: 1485, y: 150, scale: 1.5 },
        { x: 1218, y: 150, scale: 1.5 },
        { x: 951, y: 150, scale: 1.5 },
        { x: 684, y: 150, scale: 1.5 },
        { x: 417, y: 150, scale: 1.5 },
        { x: 130, y: 500, scale: 1.5 },
    ],
    9: [
        { x: 1763, y: 570, scale: 1.5 },
        { x: 1763, y: 270, scale: 1.5 },
        { x: 1458, y: 150, scale: 1.5 },
        { x: 1111, y: 150, scale: 1.5 },
        { x: 764, y: 150, scale: 1.5 },
        { x: 417, y: 150, scale: 1.5 },
        { x: 130, y: 270, scale: 1.5 },
        { x: 130, y: 570, scale: 1.5 },
    ],
    10: [
        { x: 1763, y: 570, scale: 1.5 },
        { x: 1763, y: 270, scale: 1.5 },
        { x: 1485, y: 150, scale: 1.5 },
        { x: 1218, y: 150, scale: 1.5 },
        { x: 951, y: 150, scale: 1.5 },
        { x: 684, y: 150, scale: 1.5 },
        { x: 417, y: 150, scale: 1.5 },
        { x: 130, y: 270, scale: 1.5 },
        { x: 130, y: 570, scale: 1.5 },
    ],
    11: [
        { x: 1800, y: 570, scale: 1.3 },
        { x: 1800, y: 300, scale: 1.3 },
        { x: 1563, y: 150, scale: 1.3 },
        { x: 1321, y: 150, scale: 1.3 },
        { x: 1079, y: 150, scale: 1.3 },
        { x: 837, y: 150, scale: 1.3 },
        { x: 595, y: 150, scale: 1.3 },
        { x: 353, y: 150, scale: 1.3 },
        { x: 130, y: 300, scale: 1.3 },
        { x: 130, y: 570, scale: 1.3 },
    ],
    12: [
        { x: 1800, y: 610, scale: 1.2 },
        { x: 1800, y: 367, scale: 1.2 },
        { x: 1582, y: 150, scale: 1.2 },
        { x: 1375, y: 150, scale: 1.2 },
        { x: 1168, y: 150, scale: 1.2 },
        { x: 961, y: 150, scale: 1.2 },
        { x: 754, y: 150, scale: 1.2 },
        { x: 547, y: 150, scale: 1.2 },
        { x: 340, y: 150, scale: 1.2 },
        { x: 130, y: 367, scale: 1.2 },
        { x: 130, y: 610, scale: 1.2 },
    ],
};

/** 自己座位始终在底部中央 */
export const SELF_SEAT_POS = { x: 959, y: 944, scale: 1.5 };
