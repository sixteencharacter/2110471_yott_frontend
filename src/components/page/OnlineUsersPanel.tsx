"use client"
import React from "react"
import { Users } from "lucide-react"
import { UserAvatar } from "../userAvatar"

export default function OnlineUsersPanel({
    onlineUsers,
    userCount,
    currentUser,
}: any) {
    const uniqueUsers = React.useMemo(() => {
        const userMap = new Map()
        onlineUsers.forEach((user: any) => {
            const key = user.username
            if (key && !userMap.has(key)) {
                userMap.set(key, user)
            }
        })
        const filteredUsers = Array.from(userMap.values()).filter(
            (user: any) => {
                if (!currentUser) return true
                return !(
                    user.username === currentUser.name ||
                    user.display_name === currentUser.name ||
                    user.name === currentUser.name ||
                    user.email === currentUser.email
                )
            }
        )
        return filteredUsers
    }, [onlineUsers, currentUser])
    return (
        <div className="bg-purple-500/20 border border-purple-300 rounded-lg p-4 space-y-4 h-full overflow-y-auto">
            <h3 className="text-lg font-serif font-bold text-black flex items-center gap-2 sticky top-0">
                <Users size={20} className="text-purple-400" />
                Online (
                {currentUser ? uniqueUsers.length + 1 : uniqueUsers.length})
            </h3>
            <div className="space-y-3">
                {currentUser && (
                    <div className="flex items-center gap-3 bg-purple-400/30 p-2 rounded border-2 border-purple-400">
                        <UserAvatar
                            name={currentUser.name || "User"}
                            isOnline={true}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-purple-600 font-serif text-sm font-semibold truncate">
                                {currentUser.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-purple-500">(me)</p>
                        </div>
                    </div>
                )}
                {uniqueUsers.length === 0 ? (
                    <div className="text-center text-purple-600 py-4">
                        {!currentUser && "ไม่มีผู้ใช้ออนไลน์"}
                    </div>
                ) : (
                    uniqueUsers.map((user: any, index: number) => (
                        <div
                            key={`${
                                user.keycloak_id || user.username
                            }-${index}`}
                            className="flex items-center gap-3 hover:bg-purple-400/20 p-2 rounded transition cursor-pointer"
                        >
                            <UserAvatar
                                name={user.username || user.display_name}
                                isOnline={true}
                                size="sm"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-purple-600 font-serif text-sm font-semibold truncate">
                                    {user.username}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
