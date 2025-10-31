"use client"
import React, { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { UserAvatar } from "../userAvatar"
import { Person } from "@/types/person"
import { newchatreq } from "@/types/newchatreq"

const CreateDMModal = ({
    isOpen,
    onClose,
    onCreateDM,
    allUsers,
}: {
    isOpen: boolean
    onClose: () => void
    onCreateDM: (newchatreq: newchatreq) => void
    allUsers: Person[]
}) => {
        const [searchTerm, setSearchTerm] = useState("")
        const [selectedUsers, setSelectedUsers] = useState<any[]>([])
        const [roomName, setRoomName] = useState("")
        const [chatType, setChatType] = useState<"dm" | "group">("dm")
    
        // Reset chat type to DM every time the modal is opened so DM is the default
        useEffect(() => {
            if (isOpen) {
                setChatType("dm")
                setSelectedUsers([])
                setSearchTerm("")
                setRoomName("")
            }
        }, [isOpen])
    try {
        const filtered = allUsers.filter((user) =>
            (user.display_name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )

        if (!isOpen) return null

        return (
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-purple-600 border-2 border-purple-500 rounded-lg w-full max-w-md p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-bold text-white">
                            New Direct Message
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Room name input */}
                    {chatType === "group" && (
                        <div className="mt-2">
                            <input
                                type="text"
                                placeholder="Chat room name..."
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="w-full bg-purple-700 border border-purple-500 rounded-lg pl-3 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white"
                            />
                            {roomName.trim() === "" && (
                                <p className="text-xs text-white/100 mt-1 font-bold">Enter a chat room name to enable creation.</p>
                            )}
                        </div>
                    )}

                    {/* Chat type box */}
                    <div className="mt-2 border border-white/10 rounded-lg p-3 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm text-white/80 font-medium">Chat type</h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setChatType("dm")
                                    // when switching to DM, ensure only one user remains selected
                                    setSelectedUsers((prev) => (prev && prev.length > 0 ? [prev[0]] : []))
                                }}
                                className={`px-3 py-1 rounded ${chatType === "dm" ? "bg-white text-purple-700 font-bold" : "bg-transparent text-white/80 border border-white/10 hover:bg-white/15 transition-colors"}`}
                            >
                                Direct Message
                            </button>
                            <button
                                onClick={() => setChatType("group")}
                                className={`px-3 py-1 rounded ${chatType === "group" ? "bg-white text-purple-700 font-bold" : "bg-transparent text-white/80 border border-white/10 hover:bg-white/15 transition-colors"}`}
                            >
                                Group
                            </button>
                        </div>
                    </div>

                    {/* Selected users box */}
                    {chatType === "dm" && (
                    <div className="mt-3 border border-white/10 rounded-lg p-3 bg-white/5">
                        <h3 className="text-sm text-white/80 font-medium mb-2 ">{chatType === "dm" ? "Selected user" : "Selected users"}</h3>
                        {selectedUsers.length === 0 ? (
                            <p className={`text-xs ${chatType === "dm" ? "text-white/100 font-bold" : "text-white/80"}`}>{chatType === "dm" ? "Another User Required" : "No users selected"}</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((su, i) => (
                                    <div key={su.keycloak_id || su.username || su.id || i} className="flex items-center gap-2 bg-white/10 text-white rounded-full px-3 py-1 text-sm">
                                        <span>{su.display_name || su.username || "Unknown"}</span>
                                        <button
                                            onClick={() => setSelectedUsers((prev) => prev.filter((x) => (x.keycloak_id || x.username || x.id) !== (su.keycloak_id || su.username || su.id)))}
                                            className="text-white/60 hover:text-white"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )} 
                    </div>
                    )}

                    {/* Search box */}
                    {chatType === "dm" && (
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-3 text-white/50"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-purple-700 border border-purple-500 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white"
                        />
                    </div>
                    )}

                    {/* User list */}
                    {chatType === "dm" && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="text-center text-white/70 py-4">
                                No users found
                            </p>
                        ) : (
                            filtered.map((user, index) => {
                                const key = user.uid || user.email || index
                                const isSelected = selectedUsers.some((su) => su.uid === user.uid)

                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedUsers((prev) => prev.filter((su) => su.uid !== user.uid))
                                            } else {
                                                // if chatType is dm, selecting a user should replace any existing selection
                                                if (chatType === "dm") {
                                                    setSelectedUsers([user])
                                                } else {
                                                    setSelectedUsers((prev) => [...prev, user])
                                                }
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${isSelected ? "bg-purple-500" : "hover:bg-purple-500"}`}
                                    >
                                        <UserAvatar
                                            name={user.display_name || "Unknown"}
                                            isOnline={user.status === "online"}
                                            size="md"
                                        />
                                        <div className="flex-1">
                                        <p className="text-white font-serif font-semibold">
                                            {user.display_name ||
                                                "Unknown User"}
                                        </p>
                                        <p className="text-xs text-white/60">
                                            {user.status === "online"
                                                ? "Online"
                                                : "Offline"}
                                        </p>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => {
                                setSelectedUsers([])
                                setSearchTerm("")
                                setRoomName("")
                            }}
                            className="px-3 py-2 rounded bg-transparent border border-white/20 text-white/80 hover:bg-white/15"
                        >
                            Clear
                        </button>

                        <button
                            onClick={() => {
                                const toSend = selectedUsers
                                if (chatType === "dm") {
                                    // DM must have one selected user
                                    if (!toSend || toSend.length === 0) return
                                } else {
                                    // Group: allow zero users, but require room name
                                    if (roomName.trim() === "") return
                                }
                                // Build payload in the requested key order: roomName, type, users
                                const newchatreq = {
                                    room_name: roomName.trim(),
                                    type: chatType,
                                    users: toSend,
                                }
                                onCreateDM(newchatreq)
                                onClose()
                            }}
                                disabled={chatType === "dm" ? (!selectedUsers || selectedUsers.length === 0) : (roomName.trim() === "")}
                        className={`px-4 py-2 rounded ${chatType === "dm" ? (!selectedUsers || selectedUsers.length === 0 ? "bg-white/10 text-white cursor-not-allowed" : "bg-white text-purple-700 font-bold hover:bg-white/80 transition-colors") : (roomName.trim() === "" ? "bg-white/10 text-white cursor-not-allowed" : "bg-white text-purple-700 font-bold hover:bg-white/80 transition-colors")}`}
                        >
                            {chatType === "dm" ? "Create Direct Message Chat Room" : "Create Group Chat Room"}
                        </button>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error("CreateDMModal - error:", error)
    }
}

export default CreateDMModal
