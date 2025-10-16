import { useEffect, useState } from "react"
import { apiClient } from "@/lib/apiClient"

export function useChatRooms(token?: string) {
    const [chatRooms, setChatRooms] = useState<any[]>([])
    const [isInited, setInited] = useState<boolean>(false)

    useEffect(() => {
        if (!token) return
        ;(async () => {
            const res = await apiClient.get(`/v1/user/chats`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setChatRooms(res.data)
            setInited(true)
        })()
    }, [token])

    return { chatRooms, isInited }
}
