import { Chat } from "@/types/chat"
import { Person } from "@/types/person"
import { useCallback } from "react"
import { Socket } from "socket.io-client"

export function useCreateDM(
    socket: Socket | null,
    chatRooms: Chat[],
    setActiveRoom: (id: number) => void,
    currentUser: Person | null,
    refreshChatRooms?: () => void
) {
    return useCallback(
        (payload: any) => {
            if (payload.type === "dm") {
                if (socket) {
                    const other = payload.users[0]
                    const nameParts = [other?.given_name, other?.family_name]
                        .filter(Boolean)
                        .join(" ")
                    const displayPart = other?.display_name
                        ? ` (${other.display_name})`
                        : ""
                    const chatName = `${nameParts}${displayPart}`.trim()

                    const data = {
                        chat_name: chatName || other?.display_name || "",
                        is_groupchat: false,
                        member_ids: [currentUser?.uid, other?.uid],
                    }
                    console.log(
                        "Creating chatroom with users:",
                        payload.users,
                        "and",
                        currentUser
                    )
                    console.log(data)
                    socket.emit("create_chat", data)

                    // Refresh chat rooms after creating DM
                    if (refreshChatRooms) {
                        setTimeout(() => refreshChatRooms(), 1000)
                    }
                } else {
                    throw new Error("Socket not initialized")
                }
            } else {
                if (socket) {
                    const data = {
                        chat_name: payload.room_name,
                        is_groupchat: true,
                        member_ids: payload.users.map((user: any) => user.uid),
                    }
                    console.log(
                        "Creating chatroom with users:",
                        payload.users,
                        "and",
                        currentUser
                    )
                    console.log(data)
                    socket.emit("create_chat", data)

                    // Refresh chat rooms after creating DM
                    if (refreshChatRooms) {
                        setTimeout(() => refreshChatRooms(), 1000)
                    }
                } else {
                    throw new Error("Socket not initialized")
                }
            }
        },
        [socket, chatRooms, setActiveRoom, currentUser, refreshChatRooms]
    )
}
