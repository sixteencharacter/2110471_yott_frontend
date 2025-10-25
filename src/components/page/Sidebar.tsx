"use client"
import React from "react"
import { LogOut, Plus, Search } from "lucide-react"
import { signOut } from "next-auth/react"
import ChatRoomItem from "./ChatRoomItem"
import { Chat } from "@/types/chat"

export default function Sidebar({
    searchTerm,
    setSearchTerm,
    showCreateDM,
    setShowCreateDM,
    groupRooms,
    privateRooms,
    activeRoom,
    setActiveRoom,
}: any) {
    return (
        <div className="w-72 bg-purple-500/90 rounded-lg flex flex-col shadow-lg">
            {/* Header */}
            <div className="border-b border-purple-500 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-serif font-bold text-white">
                        YOTT
                    </h1>
                    <button
                        onClick={() => signOut()}
                        className="p-2 hover:bg-purple-500 rounded-lg transition text-white/70 hover:text-white"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
                {/* Search and Create */}
                <div className="space-y-2">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-3 text-white/50"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-purple-500 border border-purple-400 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateDM(true)}
                        className="w-full flex items-center justify-center gap-2 bg-purple-400 hover:bg-purple-300 text-white font-serif py-2 rounded-lg transition-all duration-300"
                    >
                        <Plus size={18} />
                        Direct Message
                    </button>
                </div>
            </div>
            {/* Chat Rooms */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Group Chats */}
                {groupRooms.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-serif font-bold text-white/60 uppercase tracking-wider px-2 py-1">
                            Channels
                        </h3>
                        <div className="space-y-1">
                            {groupRooms.map((room: Chat) => (
                                <ChatRoomItem
                                    key={room.cid}
                                    room={room}
                                    isActive={activeRoom === room.cid}
                                    onClick={() => setActiveRoom(room.cid)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {/* Private Messages */}
                {privateRooms.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-serif font-bold text-white/60 uppercase tracking-wider px-2 py-1">
                            Direct Messages
                        </h3>
                        <div className="space-y-1">
                            {privateRooms.map((room: Chat) => (
                                <ChatRoomItem
                                    key={room.cid}
                                    room={room}
                                    isActive={activeRoom === room.cid}
                                    onClick={() => setActiveRoom(room.cid)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {groupRooms.length === 0 && privateRooms.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-white/60 font-serif">
                            No rooms found
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
