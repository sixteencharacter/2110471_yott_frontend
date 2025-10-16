import { useCallback } from "react"
import { Socket } from "socket.io-client"

export function useCreateDM(
    socket: Socket | null,
    chatRooms: any[],
    setActiveRoom: (id: number) => void
) {
    return useCallback(
        (user: any) => {
            const existingDM = chatRooms.find(
                (room) => room.name === user.name && room.type === "private"
            )
            if (!existingDM) {
                if (socket) {
                    console.log("Creating DM with user:", user)
                    const data = {
                        chat_name: "ชื่อแชท",
                        is_groupchat: false,
                        member_ids: [user.id],
                    }
                    socket.emit("create_chat", user.id, data)
                } else {
                    throw new Error("Socket not initialized")
                }
                setActiveRoom(chatRooms.length + 1)
            } else {
                setActiveRoom(existingDM.id)
            }
        },
        [socket, chatRooms, setActiveRoom]
    )
}
