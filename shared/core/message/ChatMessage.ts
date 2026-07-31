export type ChatSource = 'lobby' | 'room' | 'team' | 'system';
export interface ChatMessage {
    chatId: number;
    source: ChatSource;
    roomId?: string;
    sender: string;
    message: string;
    time: number;
}

export const CHAT_SOURCE_CONFIG: Record<
    ChatSource,
    { label: string; color: string }
> = {
    lobby: { label: '大厅', color: '#4FC3F7' },
    room: { label: '房间', color: '#81C784' },
    team: { label: '队伍', color: '#FFB74D' },
    system: { label: '系统', color: '#E57373' },
};
