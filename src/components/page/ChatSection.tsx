"use client"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { Hash, Lock, Smile, Play } from "lucide-react"
import { Message } from "@/types/message"
import { useChatRoom } from "@/components/hook/useChatContent"
import { useSession } from "next-auth/react"

export default function ChatSection({
    activeRoomData,
    openStickerModal,
    socket,
    currentUser,
    messages: allMessages = [],
}: any) {
    const [message, setMessage] = useState("")
    const { data, update, status } = useSession()

    // control pagination parameters in ChatSection: limit fixed to 6, skip managed here
    const [skip, setSkip] = useState<number>(0)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const PAGE_LIMIT = 6
    const { chatData, isInited, fetchChatHistory, loading } = useChatRoom(activeRoomData?.cid, data?.idToken, PAGE_LIMIT, skip)

    // refs and handlers to detect attempts to scroll past the top
    const messagesRef = useRef<HTMLDivElement | null>(null)
    const touchStartYRef = useRef<number | null>(null)
    const prevSocketCountRef = useRef<number>(0)
    const prevChatDataCountRef = useRef<number>(0)

    const scrollToBottom = (smooth = false) => {
        const el = messagesRef.current
        if (!el) return
        try {
            if (smooth && 'scrollTo' in el) {
                // @ts-ignore DOM options
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
            } else {
                el.scrollTop = el.scrollHeight
            }
        } catch (e) {
            el.scrollTop = el.scrollHeight
        }
    }

    const handleWheel = useCallback(async (e: React.WheelEvent<HTMLDivElement>) => {
        const el = messagesRef.current
        if (!el) return
        // If we're at the top and the user scrolls up (deltaY < 0), they are trying to scroll past the top
        if (el.scrollTop <= 0 && e.deltaY < 0) {
            // if already loading or no more, just reset to top and return
            if (loading || !hasMore) {
                el.scrollTop = 0
                //e.preventDefault()
                return
            }

            console.log("User attempted to scroll past the top of the chat - fetching older messages")
            e.preventDefault()

            const prevScrollHeight = el.scrollHeight
            const nextSkip = skip + PAGE_LIMIT
            const fetched = await fetchChatHistory({ skip: nextSkip, append: true })
            if (fetched > 0) {
                setSkip(nextSkip)
                // preserve view: after DOM updates
                requestAnimationFrame(() => {
                    if (!messagesRef.current) return
                    const newScrollHeight = messagesRef.current.scrollHeight
                    messagesRef.current.scrollTop = newScrollHeight - prevScrollHeight
                })
            }

            if (fetched < PAGE_LIMIT) {
                setHasMore(false)
            }
        }
    }, [fetchChatHistory, hasMore, loading, skip])

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        touchStartYRef.current = e.touches?.[0]?.clientY ?? null
    }, [])

    const handleTouchMove = useCallback(async (e: React.TouchEvent<HTMLDivElement>) => {
        const el = messagesRef.current
        if (!el) return
        const startY = touchStartYRef.current
        if (startY == null) return
        const currentY = e.touches?.[0]?.clientY ?? 0
        const dy = currentY - startY
        // dy > 0 means user is pulling down. If at top and pulling down, treat as scroll-past-top
        if (el.scrollTop <= 0 && dy > 20) {
            if (loading || !hasMore) {
                el.scrollTop = 0
                e.preventDefault()
                return
            }

            console.log("User attempted to scroll past the top of the chat (touch) - fetching older messages")
            e.preventDefault()

            const prevScrollHeight = el.scrollHeight
            const nextSkip = skip + PAGE_LIMIT
            const fetched = await fetchChatHistory({ skip: nextSkip, append: true })
            if (fetched > 0) {
                setSkip(nextSkip)
                requestAnimationFrame(() => {
                    if (!messagesRef.current) return
                    const newScrollHeight = messagesRef.current.scrollHeight
                    messagesRef.current.scrollTop = newScrollHeight - prevScrollHeight
                })
            }

            if (fetched < PAGE_LIMIT) {
                setHasMore(false)
            }
        }
    }, [fetchChatHistory, hasMore, loading, skip])

    // When active room changes, fetch its history
    useEffect(() => {
        if (activeRoomData?.cid) {
            // reset skip for new room
            setSkip(0)
            setHasMore(true)
            fetchChatHistory({ skip: 0 })
        }
    }, [activeRoomData?.cid])

  // Debug log to check if activeRoomData changes
  /*useEffect(() => {
    console.log("ChatSection - activeRoomData changed:", activeRoomData);
  }, [activeRoomData]);*/

  
  
    // Merge server history + realtime socket messages for current room
    const socketRoomMessages = allMessages.filter(
        (msg: Message) => msg.cid === activeRoomData?.cid
    )

    const roomMessages = [...(chatData || []), ...socketRoomMessages]

    // Auto-scroll behavior: when a new realtime message arrives, or when initial
    // chatData is loaded, scroll to bottom. Do NOT jump when older pages are prepended.
    useEffect(() => {
        const prevSocket = prevSocketCountRef.current
        const prevChat = prevChatDataCountRef.current
        const curSocket = socketRoomMessages.length
        const curChat = chatData.length

        // New realtime messages appended -> jump to bottom
        if (curSocket > prevSocket) {
            scrollToBottom(true)
        } else if (curChat > prevChat && prevChat === 0) {
            // initial load of chatData: scroll to bottom
            scrollToBottom(false)
        }

        prevSocketCountRef.current = curSocket
        prevChatDataCountRef.current = curChat
    }, [socketRoomMessages.length, chatData.length, activeRoomData?.cid])

    const handleSendMessage = () => {
        if (!message.trim() || !socket || !currentUser || !activeRoomData)
            return

        const messageData = {
            cid: activeRoomData.cid,
            message: message.trim(),
        }

        console.log("Sending message:", messageData)
        socket.emit("send_message", messageData)
        setMessage("")
        // optimistically scroll to bottom when user sends a message
        requestAnimationFrame(() => scrollToBottom(true))
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Messages are now handled centrally in useSocket hook
    return (
        <div className="flex-1 bg-purple-100 rounded-lg shadow-lg flex flex-col">
            {activeRoomData && (
                <>
                    {/* Room Header */}
                    <div className="border-b border-purple-300 p-4 bg-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                            {activeRoomData.type === "group" ? (
                                <Hash className="text-purple-600" size={24} />
                            ) : (
                                <Lock className="text-purple-600" size={24} />
                            )}
                            <div>
                                <p className="text-xl font-serif font-bold text-purple-900">
                                    {activeRoomData.name}
                                </p>
                                <p className="text-xs text-purple-600">
                                    {activeRoomData.lastMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Messages Area */}
                    <div
                        ref={messagesRef}
                        onWheel={handleWheel}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        className="flex-1 p-4 overflow-y-auto"
                    >
                        {roomMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-purple-600 font-serif text-center text-lg">
                                    Welcome to {activeRoomData.name}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {roomMessages.map(
                                    (msg: Message, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-lg p-3 shadow-sm"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {msg.s_name[0] || "U"}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-purple-900">
                                                            {msg.s_name ||
                                                                "Unknown User"}
                                                        </span>
                                                        <span className="text-xs text-purple-500">
                                                            {new Date(
                                                                msg.timestamp ||
                                                                    Date.now()
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-purple-800">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                    {/* Message Input */}
                    <div className="border-t border-purple-300 p-4 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 bg-purple-100 border border-purple-300 rounded-lg px-4 py-3 text-purple-900 placeholder-purple-500 focus:outline-none focus:border-purple-600"
                            />
                            <button
                                onClick={openStickerModal}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
                                title="Add Sticker"
                            >
                                <Smile size={20} />
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
                                title="Send Message"
                            >
                                <Play size={20} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
