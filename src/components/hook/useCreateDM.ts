import { useCallback } from "react"
import { Socket } from "socket.io-client"

export function useCreateDM(
    socket: Socket | null,
    chatRooms: any[],
    setActiveRoom: (id: number) => void,
    currentUser: any,
    refreshChatRooms?: () => void
) {
    return useCallback(
        (user: any) => {
            const existingDM = chatRooms.find(
                (room) => room.name === user.name && room.type === "private"
            )
            if (!existingDM) {
                if (socket) {
                    console.log(
                        "Creating DM with user:",
                        user,
                        "and",
                        currentUser
                    )
                    const data = {
                        chat_name: "ชื่อแชท",
                        is_groupchat: false,
                        member_ids: [currentUser.keycloak_id, user.id],
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
            } else {
                setActiveRoom(existingDM.id)
            }
        },
        [socket, chatRooms, setActiveRoom, currentUser, refreshChatRooms]
    )
}
