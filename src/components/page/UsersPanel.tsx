"use client"
import React from "react"
import { Users } from "lucide-react"
import { UserAvatar } from "../userAvatar"
import { off } from "process"
import { Person } from "@/types/person"
export default function UsersPanel({
    allUsers,
    userCount,
    currentUser,
}: {
    allUsers: Person[]
    userCount: number
    currentUser: Person | null
}) {
    const uniqueUsers = React.useMemo(() => {
        const userMap = new Map()
        allUsers.forEach((user: Person) => {
            const key = user.username
            if (key && !userMap.has(key)) {
                userMap.set(key, user)
            }
        })

        const allUsers_map = Array.from(userMap.values())

        const onlineUsersList = allUsers_map.filter(
            (user: Person) => user.status === "online"
        )

        const offlineUsersList = allUsers_map.filter(
            (user: Person) => user.status === "offline"
        )

        return { online: onlineUsersList, offline: offlineUsersList }
    }, [allUsers, currentUser])
    return (
        <div className="bg-purple-500/20 border border-purple-300 rounded-lg p-4 space-y-4 h-full overflow-y-auto">
            <h3 className="text-lg font-serif font-bold text-green-600 flex items-center gap-2 sticky top-0">
                <Users size={20} className="text-purple-400" />
                Online ({userCount})
            </h3>
            <div className="space-y-3">
                {currentUser && (
                    <div className="flex items-center gap-3 bg-purple-400/30 p-2 rounded border-2 border-purple-400">
                        <UserAvatar
                            name={currentUser.username || "User"}
                            isOnline={true}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-purple-600 font-serif text-sm font-semibold truncate">
                                {currentUser.username || "Unknown User"}
                            </p>
                            <p className="text-xs text-purple-500">(me)</p>
                        </div>
                    </div>
                )}
                {/* Online Section */}
                <div className="space-y-2">
                    {uniqueUsers.online.length === 0 ? (
                        <div className="text-center text-gray-500 py-2 text-sm"></div>
                    ) : (
                        <div className="space-y-1">
                            {uniqueUsers.online.map(
                                (user: Person, index: number) => (
                                    <div
                                        key={`online-${
                                            user.uid || user.username
                                        }-${index}`}
                                        className="flex items-center gap-3 hover:bg-purple-400/20 p-2 rounded transition cursor-pointer"
                                    >
                                        <div className="relative">
                                            <UserAvatar
                                                name={
                                                    user.username ||
                                                    user.display_name
                                                }
                                                isOnline={true}
                                                size="sm"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-purple-600 font-serif text-sm font-semibold truncate">
                                                {user.username}
                                            </p>
                                            <p className="text-xs text-purple-500">
                                                {user.display_name}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Offline Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-serif font-bold text-red-400 flex items-center gap-2 sticky top-0">
                        <Users size={20} className="text-purple-400" />
                        Offline (
                        {
                            uniqueUsers.offline.filter(
                                (user: Person) => user.status === "offline"
                            ).length
                        }
                        )
                    </h3>
                    {uniqueUsers.offline.filter(
                        (user: Person) => user.status === "offline"
                    ).length === 0 ? (
                        <div className="text-center text-gray-500 py-2 text-sm">
                            ไม่มีผู้ใช้ออฟไลน์
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {uniqueUsers.offline
                                .filter(
                                    (user: Person) => user.status === "offline"
                                )
                                .map((user: Person, index: number) => (
                                    <div
                                        key={`offline-${
                                            user.uid || user.username
                                        }-${index}`}
                                        className="flex items-center gap-3 hover:bg-gray-200/50 p-2 rounded transition cursor-pointer opacity-70"
                                    >
                                        <div className="relative">
                                            <UserAvatar
                                                name={
                                                    user.username ||
                                                    user.display_name
                                                }
                                                isOnline={false}
                                                size="sm"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-600 font-serif text-sm font-semibold truncate">
                                                {user.username}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user.display_name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
