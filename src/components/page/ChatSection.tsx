"use client"
import React, { useState, useEffect } from "react"
import { Hash, Lock, Smile, Play } from "lucide-react"

export default function ChatSection({
    activeRoomData,
    openStickerModal,
    socket,
    currentUser,
    messages: allMessages = [],
}: any) {
    const [message, setMessage] = useState("")

    // Filter messages for current room
    const roomMessages = allMessages.filter(
        (msg: any) => msg.cid === activeRoomData?.cid
    )

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
                    <div className="flex-1 p-4 overflow-y-auto">
                        {roomMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-purple-600 font-serif text-center text-lg">
                                    Welcome to {activeRoomData.name}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {roomMessages.map((msg: any, index: number) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg p-3 shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {msg.user?.name?.[0] ||
                                                    msg.user_id?.[0] ||
                                                    "U"}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-purple-900">
                                                        {msg.user?.name ||
                                                            msg.user_id ||
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
                                                    {msg.data}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
