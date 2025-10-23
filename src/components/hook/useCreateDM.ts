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
        (user: Person) => {
            if (socket) {
                console.log("Creating DM with user:", user, "and", currentUser)
                const data = {
                    chat_name: "ชื่อแชท",
                    is_groupchat: false,
                    member_ids: [currentUser?.uid, user.uid],
                }
                console.log(data)
                socket.emit("create_chat", data)

                // Refresh chat rooms after creating DM
                if (refreshChatRooms) {
                    setTimeout(() => refreshChatRooms(), 1000)
                }
            } else {
                throw new Error("Socket not initialized")
            }
            setActiveRoom(chatRooms.length + 1)
        },
        [socket, chatRooms, setActiveRoom, currentUser, refreshChatRooms]
    )
}
