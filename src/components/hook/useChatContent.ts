import { Message } from "@/types/message";
import React, { useState } from "react";
import { apiClient } from "@/lib/apiClient"

// useChatRoom supports limit and skip defaults. It exposes fetchChatHistory(opts)
// which returns the number of messages fetched. When called with { append: true }
// the fetched page is appended to the existing chatData (useful for pagination).
export function useChatRoom(cid?: number | null, token?: string, limit: number = 6, skip: number = 0) {
    const [chatData, setChatData] = useState<Message[]>([]);
    const [isInited, setInited] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    // fetchChatHistory returns the number of messages fetched (0 on error or none).
    // opts: { limit?, skip?, append? }
    const fetchChatHistory = async (opts?: { limit?: number; skip?: number; append?: boolean }): Promise<number> => {
        if (!cid) {
            setChatData([])
            setInited(true)
            return 0
        }

        const useLimit = opts?.limit ?? limit
        const useSkip = opts?.skip ?? skip

        setLoading(true)
        try {
            const response = await apiClient.get(`/v1/chats/${cid}/history`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...(useLimit !== undefined ? { limit: useLimit } : {}), ...(useSkip !== undefined ? { skip: useSkip } : {}) },
            });

            const raw = response.data || []

            // Normalize backend shape to the app Message type
            const mapped = (raw as any[]).map((m: any) => ({
                s_id: m.uid ?? m.sender_id ?? m.s_id ?? null,
                s_name: m.preferred_username ?? m.sender_name ?? m.s_name ?? "Unknown",
                timestamp: m.timestamp ?? m.created_at ?? null,
                message: m.msg_content ?? m.text ?? m.message ?? "",
                cid: m.cid ?? cid,
                type: m.type ?? "message"
            })) as Message[]

            // Flip the order so that the first is last and last is first (newest-first)
            const flipped = mapped.slice().reverse()

            if (opts?.append) {
                // place the newly fetched page ABOVE the existing messages
                // so that older messages appear above the current ones
                setChatData((prev) => [...flipped, ...prev])
            } else {
                setChatData(flipped)
            }

            setInited(true)
            console.log("Fetched chat history for cid", cid, { limit: useLimit, skip: useSkip, count: flipped.length, append: !!opts?.append })
            return flipped.length
        } catch (error) {
            console.error("Error fetching chat history:", error)
            if (!opts?.append) setChatData([])
            setInited(true)
            return 0
        } finally {
            setLoading(false)
        }
    }

    return { chatData, isInited, fetchChatHistory, loading } as const
}