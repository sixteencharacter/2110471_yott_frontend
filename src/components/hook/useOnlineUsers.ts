import { Person } from "@/types/person"
import { useMemo } from "react"

export function useOnlineUsers(allUsers: Person[], currentUser: Person | null) {
    return useMemo(() => {
        return allUsers
            .filter((user) => {
                if (!currentUser) return true
                return !(
                    user.uid === currentUser.uid ||
                    user.username === currentUser.username ||
                    user.display_name === currentUser.display_name ||
                    user.email === currentUser.email
                )
            })
            .map((user, index) => ({
                id: user.uid || user.username || index,
                name: user.username || user.display_name || "Unknown User",
                isOnline: user.status === "online",
            }))
    }, [allUsers, currentUser])
}
