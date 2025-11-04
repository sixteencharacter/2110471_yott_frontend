"use client"
import React, { useState, useEffect, useRef, useCallback } from "react"
import {
    Hash,
    Lock,
    Smile,
    Play,
    MessageSquare,
    Users,
    Wifi,
    Sparkles,
    ChevronDown,
} from "lucide-react"
import { Message } from "@/types/message"
import { useChatRoom } from "@/components/hook/useChatContent"
import { useSession } from "next-auth/react"
import { apiClient } from "@/lib/apiClient"

export default function ChatSection({
    activeRoomData,
    openStickerModal,
    socket,
    currentUser,
    messages: allMessages = [],
}: any) {
    const [message, setMessage] = useState("")
    const [isParaphrasing, setIsParaphrasing] = useState(false)
    const [showAIOptions, setShowAIOptions] = useState(false)
    const { data, update, status } = useSession()

    // control pagination parameters in ChatSection: limit fixed to 6, skip managed here
    const [skip, setSkip] = useState<number>(0)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const PAGE_LIMIT = 6
    const { chatData, isInited, fetchChatHistory, loading } = useChatRoom(
        activeRoomData?.cid,
        data?.idToken,
        PAGE_LIMIT,
        skip
    )

    // refs and handlers to detect attempts to scroll past the top
    const messagesRef = useRef<HTMLDivElement | null>(null)
    const touchStartYRef = useRef<number | null>(null)
    const prevSocketCountRef = useRef<number>(0)
    const prevChatDataCountRef = useRef<number>(0)

    const stickerHost = process.env.NEXT_PUBLIC_STICKER_BASE
    const aiOptionsRef = useRef<HTMLDivElement | null>(null)

    // Close AI options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                aiOptionsRef.current &&
                !aiOptionsRef.current.contains(event.target as Node)
            ) {
                setShowAIOptions(false)
            }
        }

        if (showAIOptions) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showAIOptions])

    const scrollToBottom = (smooth = false) => {
        const el = messagesRef.current
        if (!el) return
        try {
            if (smooth && "scrollTo" in el) {
                // @ts-ignore DOM options
                el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
            } else {
                el.scrollTop = el.scrollHeight
            }
        } catch (e) {
            el.scrollTop = el.scrollHeight
        }
    }

    const handleWheel = useCallback(
        async (e: React.WheelEvent<HTMLDivElement>) => {
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

                console.log(
                    "User attempted to scroll past the top of the chat - fetching older messages"
                )
                e.preventDefault()

                const prevScrollHeight = el.scrollHeight
                const nextSkip = skip + PAGE_LIMIT
                const fetched = await fetchChatHistory({
                    skip: nextSkip,
                    append: true,
                })
                if (fetched > 0) {
                    setSkip(nextSkip)
                    // preserve view: after DOM updates
                    requestAnimationFrame(() => {
                        if (!messagesRef.current) return
                        const newScrollHeight = messagesRef.current.scrollHeight
                        messagesRef.current.scrollTop =
                            newScrollHeight - prevScrollHeight
                    })
                }

                if (fetched < PAGE_LIMIT) {
                    setHasMore(false)
                }
            }
        },
        [fetchChatHistory, hasMore, loading, skip]
    )

    const handleTouchStart = useCallback(
        (e: React.TouchEvent<HTMLDivElement>) => {
            touchStartYRef.current = e.touches?.[0]?.clientY ?? null
        },
        []
    )

    const handleTouchMove = useCallback(
        async (e: React.TouchEvent<HTMLDivElement>) => {
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

                console.log(
                    "User attempted to scroll past the top of the chat (touch) - fetching older messages"
                )
                e.preventDefault()

                const prevScrollHeight = el.scrollHeight
                const nextSkip = skip + PAGE_LIMIT
                const fetched = await fetchChatHistory({
                    skip: nextSkip,
                    append: true,
                })
                if (fetched > 0) {
                    setSkip(nextSkip)
                    requestAnimationFrame(() => {
                        if (!messagesRef.current) return
                        const newScrollHeight = messagesRef.current.scrollHeight
                        messagesRef.current.scrollTop =
                            newScrollHeight - prevScrollHeight
                    })
                }

                if (fetched < PAGE_LIMIT) {
                    setHasMore(false)
                }
            }
        },
        [fetchChatHistory, hasMore, loading, skip]
    )

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
            type: "message",
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

    const handleParaphrase = async (style: string) => {
        if (!message.trim() || !data?.idToken) return

        setIsParaphrasing(true)
        setShowAIOptions(false)

        try {
            console.log("Sending paraphrase request:", {
                text: message.trim(),
                style: style,
            })
            console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
            // Use fetch for proper streaming support as per Next.js discussion
            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_BACKEND_URL ||
                    "http://localhost:8000"
                }/v1/paraphrase/${style}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${data.idToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        text: message.trim(),
                    }),
                }
            )

            if (!response.ok) {
                throw new Error(`Failed to paraphrase: ${response.status}`)
            }

            // Handle streaming response using ReadableStream
            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error("No response body")
            }

            let responseText = ""
            const decoder = new TextDecoder()

            try {
                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        console.log("Streaming completed")
                        break
                    }

                    // Decode the chunk and parse Server-Sent Events format
                    const chunkText = decoder.decode(value, { stream: true })
                    console.log("Received chunk:", chunkText)

                    // Handle Server-Sent Events format: "data: {...}"
                    const lines = chunkText.split("\n")
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                // Extract JSON part after "data: "
                                const jsonPart = line.substring(6) // Remove "data: " prefix
                                const chunkData = JSON.parse(jsonPart)

                                if (chunkData.accumulated) {
                                    // Use the accumulated text directly and remove extra quotes
                                    const cleanedText =
                                        chunkData.accumulated.replace(
                                            /^"|"$/g,
                                            ""
                                        )
                                    setMessage(cleanedText)
                                    responseText = chunkData.accumulated
                                    console.log(
                                        "Parsed accumulated text:",
                                        cleanedText
                                    )
                                }
                            } catch (parseError) {
                                console.log(
                                    "Could not parse SSE data line:",
                                    line,
                                    parseError
                                )
                            }
                        } else if (line.trim()) {
                            // Accumulate non-data lines for fallback
                            responseText += line
                        }
                    }
                }

                // Final cleanup - responseText should already contain the final accumulated text
                if (responseText) {
                    const cleanedText = responseText.replace(/^"|"$/g, "")
                    setMessage(cleanedText)
                    console.log("Final paraphrased text:", cleanedText)
                }
            } finally {
                reader.releaseLock()
            }
        } catch (error) {
            console.error("Paraphrasing error:", error)
            // Could add error handling UI here
        } finally {
            setIsParaphrasing(false)
        }
    }

    // Messages are now handled centrally in useSocket hook
    return (
        <div className="flex-1 bg-purple-100 rounded-lg shadow-lg flex flex-col overflow-y-hidden">
            {activeRoomData === undefined && (
                <>
                    <div className="border-b border-purple-300 p-4 bg-white flex-1 justify-center items-center flex-col w-full h-auto rounded-t-lg">
                        <div className="max-w-full mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-center mb-12 mt-3">
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-xl font-bold text-purple-700">
                                    Get Started in 3 Easy Steps
                                </h1>
                            </div>

                            {/* Steps Row */}
                            <div className="flex gap-6 mb-8">
                                {/* Step 1 */}
                                <div className="flex-1 bg-white/60 backdrop-blur rounded-3xl p-8 border-2 border-purple-200">
                                    <div className="inline-block bg-purple-200 text-purple-700 font-bold px-4 py-1 rounded-full text-sm mb-6">
                                        STEP 1
                                    </div>
                                    <h2 className="text-2xl font-bold text-purple-700 mb-4">
                                        Find a Friend
                                    </h2>
                                    <p className="text-purple-600 text-lg leading-relaxed">
                                        Use "Direct Message" and their User ID
                                        to start a chat.
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className="flex-1 bg-white/60 backdrop-blur rounded-3xl p-8 border-2 border-purple-200">
                                    <div className="inline-block bg-purple-200 text-purple-700 font-bold px-4 py-1 rounded-full text-sm mb-6">
                                        STEP 2
                                    </div>
                                    <h2 className="text-2xl font-bold text-purple-700 mb-4">
                                        Join a Group
                                    </h2>
                                    <p className="text-purple-600 text-lg leading-relaxed">
                                        Click "Join Group" to explore public
                                        channels.
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className="flex-1 bg-white/60 backdrop-blur rounded-3xl p-8 border-2 border-purple-200">
                                    <div className="inline-block bg-purple-200 text-purple-700 font-bold px-4 py-1 rounded-full text-sm mb-6">
                                        STEP 3
                                    </div>
                                    <h2 className="text-xl font-bold text-purple-700 mb-4">
                                        See Who's Here
                                    </h2>
                                    <p className="text-purple-600 text-lg leading-relaxed">
                                        The "Online Users" list shows who is
                                        active right now.
                                    </p>
                                </div>
                            </div>

                            {/* Bible Verse Section */}
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
                                <div className="max-w-xl mx-auto text-center">
                                    <div className="text-6xl mb-4 opacity-50">
                                        "
                                    </div>
                                    <p className="text-md font-light leading-relaxed mb-6 italic">
                                        Two are better than one, because they
                                        have a good return for their labor: If
                                        either of them falls down, one can help
                                        the other up.
                                    </p>
                                    <p className="text-purple-200 text-lg font-medium">
                                        — Ecclesiastes 4:9-10
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
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
                                                    {msg.type == "sticker" ? (
                                                        <img
                                                            src={
                                                                stickerHost +
                                                                msg.message
                                                            }
                                                            className="w-50 h-50 object-contain"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    stickerHost +
                                                                    "/assets/stickers/fallback.png"
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="text-purple-800">
                                                            {msg.message}
                                                        </p>
                                                    )}
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
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                disabled={isParaphrasing}
                                className="flex-1 bg-purple-100 border border-purple-300 rounded-lg px-4 py-3 text-purple-900 placeholder-purple-500 focus:outline-none focus:border-purple-600 disabled:opacity-50"
                            />

                            {/* AI Paraphrasing Button - only show when there's text */}
                            {message.trim() && (
                                <div className="relative" ref={aiOptionsRef}>
                                    <button
                                        onClick={() =>
                                            setShowAIOptions(!showAIOptions)
                                        }
                                        disabled={isParaphrasing}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white p-3 rounded-lg transition-all flex items-center justify-center group"
                                        title="Paraphrasing AI Tools"
                                    >
                                        <Sparkles
                                            size={20}
                                            className={
                                                isParaphrasing
                                                    ? "animate-spin"
                                                    : ""
                                            }
                                        />
                                        <ChevronDown
                                            size={16}
                                            className={`ml-1 transition-transform ${
                                                showAIOptions
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </button>

                                    {/* AI Options Dropdown */}
                                    {showAIOptions && (
                                        <div className="absolute bottom-full mb-2 right-0 bg-white border border-purple-300 rounded-lg shadow-lg py-2 min-w-[120px] z-10">
                                            <button
                                                onClick={() =>
                                                    handleParaphrase("royal")
                                                }
                                                disabled={isParaphrasing}
                                                className="w-full px-4 py-2 text-left text-purple-900 hover:bg-purple-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <span className="text-purple-600">
                                                    👑
                                                </span>
                                                Royal
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={openStickerModal}
                                disabled={isParaphrasing}
                                className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
                                title="Add Sticker"
                            >
                                <Smile size={20} />
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim() || isParaphrasing}
                                className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
                                title="Send Message"
                            >
                                <Play size={20} fill="currentColor" />
                            </button>
                        </div>

                        {/* Paraphrasing Status */}
                        {isParaphrasing && (
                            <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                                <Sparkles size={16} className="animate-spin" />
                                AI is paraphrasing your message...
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
