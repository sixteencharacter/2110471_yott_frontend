import { useEffect, useState } from "react"
import { apiClient } from "@/lib/apiClient"

export function useChatRooms(token?: string) {
    const [chatRooms, setChatRooms] = useState<any[]>([])
    const [isInited, setInited] = useState<boolean>(false)

    const fetchChatRooms = async () => {
        if (!token) return
        try {
            const res = await apiClient.get(`/v1/user/chats`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            console.log("Fetched chat rooms:", res.data)
            console.log(
                "Type of res.data:",
                typeof res.data,
                Array.isArray(res.data)
            )

            // Map backend data to UI format
            const mappedRooms = res.data.map((room: any) => ({
                id: room.cid,
                type: room.is_groupchat ? "group" : "private",
                name: room.name,
                lastMessage: "No messages yet",
                unread: 0,
            }))

            console.log("Mapped rooms:", mappedRooms)
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
