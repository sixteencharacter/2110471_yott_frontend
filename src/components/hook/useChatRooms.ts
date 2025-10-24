import { useEffect, useState } from "react"
import { apiClient } from "@/lib/apiClient"
import { Chat } from "@/types/chat"

export function useChatRooms(token?: string) {
    const [chatRooms, setChatRooms] = useState<Chat[]>([])
    const [isInited, setInited] = useState<boolean>(false)

    const fetchChatRooms = async () => {
        if (!token) return
        try {
            const res = await apiClient.get(`/v1/user/chats`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            // Map backend data to UI format
            const mappedRooms = res.data.map((room: Chat) => ({
                cid: room.cid,
                is_groupchat: room.is_groupchat,
                name: room.name,
                unread: 0,
            }))

            setChatRooms(mappedRooms)
            setInited(true)
        } catch (error) {
            console.error("Error fetching chat rooms:", error)
            setInited(true)
        }
    }

    useEffect(() => {
        fetchChatRooms()
    }, [token])

    return { chatRooms, isInited, refreshChatRooms: fetchChatRooms }
}
