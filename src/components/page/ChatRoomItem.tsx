"use client"
import React from "react"
import { Hash, Lock } from "lucide-react"
import { Chat } from "@/types/chat"

const ChatRoomItem = ({
    room,
    isActive,
    onClick,
}: {
    room: Chat
    isActive: boolean
    onClick: () => void
}) => {
    const isGroup = room.is_groupchat === true

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                isActive
                    ? "bg-purple-400 text-white"
                    : "text-white/70 hover:bg-purple-400/30 hover:text-white"
            }`}
        >
            {isGroup ? (
                <Hash size={18} className="flex-shrink-0" />
            ) : (
                <Lock size={18} className="flex-shrink-0" />
            )}
            <span className="font-serif font-semibold truncate flex-1">
                {room.name}
            </span>
            {room.unread > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {room.unread}
                </div>
            )}
        </button>
    )
}

export default ChatRoomItem
