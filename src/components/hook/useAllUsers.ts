import { Person } from "@/types/person"
import { useMemo } from "react"

export function useAllUsers(onlineUsers: Person[], currentUser: Person | null) {
    return useMemo(() => {
        // For now, we only have online users from socket
        // In a real app, you'd fetch all users from an API endpoint
        return onlineUsers
            .filter((user) => {
                if (!currentUser) return true
                return !(
                    user.uid === currentUser.uid ||
                    user.given_name === currentUser.given_name ||
                    user.family_name === currentUser.family_name ||
                    user.email === currentUser.email
                )
            })
            .map((user, index) => ({
                id: user.uid || index,
                name: user.given_name || user.family_name || "Unknown User",
                isOnline: user.status === "online",
            }))
    }, [onlineUsers, currentUser])
}
