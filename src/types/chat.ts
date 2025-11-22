export interface Chat {
    cid: number
    name: string
    is_groupchat: boolean
    unread: number
    is_own? : boolean
}
