"use client"
import React, { useState } from "react"
import { Search, X } from "lucide-react"
import { UserAvatar } from "../userAvatar"

const CreateDMModal = ({
    isOpen,
    onClose,
    onCreateDM,
    allUsers,
}: {
    isOpen: boolean
    onClose: () => void
    onCreateDM: (user: any) => void
    allUsers: any[]
}) => {
    const [searchTerm, setSearchTerm] = useState("")

    const filtered = allUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
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

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <p className="text-center text-white/70 py-4">
                            No users found
                        </p>
                    ) : (
                        filtered.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => {
                                    onCreateDM(user)
                                    onClose()
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-purple-500 rounded-lg transition text-left"
                            >
                                <UserAvatar
                                    name={user.name}
                                    isOnline={user.isOnline}
                                    size="md"
                                />
                                <div className="flex-1">
                                    <p className="text-white font-serif font-semibold">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-white/60">
                                        {user.isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateDMModal
