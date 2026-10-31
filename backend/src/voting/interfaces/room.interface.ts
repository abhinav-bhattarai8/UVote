export interface Option {
    id: number,
    text: string,
    votes: number
}

export interface Room {
    roomId: string,
    hostSocketId: string,
    participants: number,
    question: string,
    options: Option[],
    status: 'OPEN'| 'ONVOTE' | 'CLOSED'
}