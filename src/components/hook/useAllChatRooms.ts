import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@/lib/apiClient"
import { Chat } from "@/types/chat"
import { useSession } from "next-auth/react"

export function useAllChatRooms() {
    const { data } = useSession()
    //console.log("useAllChatRooms token:", token)
    const [allChats, setAllChats] = useState<Chat[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAll = async () => {
          if (data?.idToken){
            console.log("data",data)
            setLoading(true)
            setError(null)
            try {
                const res = await apiClient.get(`/v1/chats`, {
                    headers: { Authorization: `Bearer ${data?.idToken}` },
                })
                // Expect backend to return an array of chat objects
                setAllChats(res.data || [])
                console.log("useAllChatRooms fetched:", res.data)
                return res.data || []
            } catch (err: any) {
                console.error("useAllChatRooms fetch error:", err)
                setError(err?.message ?? String(err))
                setAllChats([])
                return []
            } finally {
                setLoading(false)
            }
        }
      }

        // run the async fetch; do not return a Promise from useEffect
        fetchAll()
    }, [data])

    return { allChats, loading, error} as const
}

export default useAllChatRooms

