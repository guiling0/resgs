import {
    WindowDatas,
    WindowItemDatas,
    WindowOptions,
    WindowPageDatas,
    WindowRowDatas,
} from '../room/room.types';

export interface MsgWindow {
    type: 'MsgWindow';
    options: WindowOptions;
    data?: WindowDatas | WindowRowDatas | WindowPageDatas | WindowItemDatas;
    create?: boolean;
    close?: boolean;
}
