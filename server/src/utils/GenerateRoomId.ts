let roomid = 0;

export function generateRoomId(isPrivate: boolean = false) {
    let id = 1000 + roomid++;
    return (isPrivate ? (id *= -1) : id).toString();
}
