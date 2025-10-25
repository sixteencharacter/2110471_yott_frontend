import React from "react"
import { Users, Hash } from "lucide-react"
import { UserAvatar } from "../userAvatar"
import { useGroupUsers } from "@/components/hook/useGroupUsers"
import { Person } from "@/types/person"

interface GroupOnlineUsersPanelProps {
    token?: string
    roomId?: number
    currentUser?: Person | null
    allUsers?: Person[]
    groupName?: string
}

export default function GroupOnlineUsersPanel({
    token,
    roomId,
    currentUser,
    allUsers,
    groupName = "Group Chat",
}: GroupOnlineUsersPanelProps) {
    const { groupUsers, loading, error } = useGroupUsers(
        token,
        roomId,
        allUsers
    )

    // Filter out current user and organize by status
    const otherUsers = groupUsers.filter(
        (user) =>
            user.uid !== currentUser?.uid &&
            user.display_name !== currentUser?.display_name
    )

    const uniqueUsers = React.useMemo(() => {
        const onlineUsersList = otherUsers.filter(
            (user: Person) => user.status === "online"
        )

        const offlineUsersList = otherUsers.filter(
            (user: Person) => user.status === "offline"
        )

        return { online: onlineUsersList, offline: offlineUsersList }
    }, [otherUsers])

    console.log("Other users in group:", otherUsers)
    if (loading) {
        return (
            <div className="w-80 bg-white rounded-lg shadow-lg">
                <div className="p-4 border-b border-purple-300">
                    <h3 className="text-lg font-serif font-bold text-purple-900">
                        Group Members
                    </h3>
                </div>
                <div className="p-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-80 bg-white rounded-lg shadow-lg">
                <div className="p-4 border-b border-purple-300">
                    <h3 className="text-lg font-serif font-bold text-purple-900">
                        Group Members
                    </h3>
                </div>
                <div className="p-4 text-center text-red-500">
                    <p>Error loading members</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-80 bg-white rounded-lg shadow-lg">
            <div className="bg-purple-500/20 border border-purple-300 rounded-lg p-4 space-y-4 h-full overflow-y-auto">
                {/* Group Name Header */}
                <div className="border-b border-purple-300 pb-2 mb-4">
                    <h2 className="text-xl font-serif font-bold text-purple-900 flex items-center gap-2">
                        <Hash size={20} className="text-purple-600" />
                        {groupName}
                    </h2>
                </div>

                {/* Online Section */}
                <h3 className="text-lg font-serif font-bold text-green-600 flex items-center gap-2 sticky top-0">
                    <Users size={20} className="text-purple-400" />
                    Online ({uniqueUsers.online.length + (currentUser ? 1 : 0)})
                </h3>

                <div className="space-y-3">
                    {/* Current User */}
                    {currentUser && (
                        <div className="flex items-center gap-3 bg-purple-400/30 p-2 rounded border-2 border-purple-400">
                            <UserAvatar
                                name={currentUser.display_name || "User"}
                                isOnline={true}
                                size="sm"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-purple-600 font-serif text-sm font-semibold truncate">
                                    {currentUser.display_name || "Unknown User"}
                                </p>
                                <p className="text-xs text-purple-500">(me)</p>
                            </div>
                        </div>
                    )}

                    {/* Online Users */}
                    <div className="space-y-2">
                        {uniqueUsers.online.length === 0 ? (
                            <div className="text-center text-gray-500 py-2 text-sm"></div>
                        ) : (
                            <div className="space-y-1">
                                {uniqueUsers.online.map(
                                    (user: Person, index: number) => (
                                        <div
                                            key={`online-${
                                                user.uid || user.display_name
                                            }-${index}`}
                                            className="flex items-center gap-3 hover:bg-purple-400/20 p-2 rounded transition cursor-pointer"
                                        >
                                            <UserAvatar
                                                name={
                                                    user.display_name ||
                                                    "Unknown User"
                                                }
                                                isOnline={true}
                                                size="sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-purple-600 font-serif text-sm font-semibold truncate">
                                                    {user.display_name ||
                                                        "Unknown User"}
                                                </p>
                                                <p className="text-xs text-purple-500">
                                                    {user.display_name ||
                                                        "Unknown User"}
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
                            Offline ({uniqueUsers.offline.length})
                        </h3>
                        {uniqueUsers.offline.length === 0 ? (
                            <div className="text-center text-gray-500 py-2 text-sm">
                                ไม่มีผู้ใช้ออฟไลน์
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {uniqueUsers.offline.map(
                                    (user: Person, index: number) => (
                                        <div
                                            key={`offline-${
                                                user.uid || user.display_name
                                            }-${index}`}
                                            className="flex items-center gap-3 hover:bg-gray-200/50 p-2 rounded transition cursor-pointer opacity-70"
                                        >
                                            <UserAvatar
                                                name={
                                                    user.display_name ||
                                                    "Unknown User"
                                                }
                                                isOnline={false}
                                                size="sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-600 font-serif text-sm font-semibold truncate">
                                                    {user.display_name ||
                                                        "Unknown User"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {user.display_name ||
                                                        "Unknown User"}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
