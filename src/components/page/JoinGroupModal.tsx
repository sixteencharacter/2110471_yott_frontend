"use client"
import React, { useEffect, useState } from "react";
import { Chat } from "@/types/chat";
import useAllChatRooms from "@/components/hook/useAllChatRooms";
import { Search, X } from "lucide-react";
import { UserAvatar } from "../userAvatar";

const JoinGroupModal = ({
  isOpen,
  onClose,
  onJoinGroup,
  groupRooms,
}: {
  isOpen: boolean
  onClose: () => void
  onJoinGroup: (groupCode: number) => void
  groupRooms: Chat[]
}) => {
  const { allChats, loading, error } = useAllChatRooms()
  const [searchTerm, setSearchTerm] = useState("")

  if (!isOpen) return null

  const existingCids = new Set((groupRooms || []).map((r: Chat) => r.cid))
  const groups = (allChats || []).filter((c: Chat) => !!c.is_groupchat && !existingCids.has(c.cid))
  const filtered = groups.filter((g: Chat) => (g.name || `Channel ${g.cid}`).toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-purple-600 border-2 border-purple-500 rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-white">Join a Channel</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-white/50" size={18} />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-purple-700 border border-purple-500 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner mr-2" />
            <span className="text-white">Loading channels...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-white/90">No channels available</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filtered.map((room: Chat) => (
              <div key={room.cid} className="flex items-center justify-between p-2 rounded">
                <div className="flex items-center gap-3">
                  <UserAvatar name={room.name || `Channel ${room.cid}`} isOnline={false} size="md" />
                  <div>
                    <div className="font-medium text-white">{room.name || `Channel ${room.cid}`}</div>
                    <div className="text-xs text-white/60">ID: {room.cid}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onJoinGroup(room.cid)
                      onClose()
                    }}
                    className="px-3 py-1 rounded bg-white text-purple-700 font-medium text-sm hover:bg-white/80 transition-colors"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JoinGroupModal