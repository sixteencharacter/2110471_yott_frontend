import { Person } from "./person"

export interface newchatreq {
    room_name?: string
    type: "dm" | "group"
    users: Person[]
}
