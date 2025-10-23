import { useMemo } from "react"

export function useAllUsers(onlineUsers: any[], currentUser: any) {
    return useMemo(() => {
        // For now, we only have online users from socket
        // In a real app, you'd fetch all users from an API endpoint
        return onlineUsers
            .filter((user) => {
                if (!currentUser) return true
                return !(
                    user.keycloak_id === currentUser.keycloak_id ||
                    user.username === currentUser.username ||
                    user.display_name === currentUser.display_name ||
                    user.email === currentUser.email
                )
            })
            .map((user, index) => ({
                id: user.keycloak_id || user.username || index,
                name: user.username || user.display_name || "Unknown User",
                isOnline: user.status === "online",
            }))
    }, [onlineUsers, currentUser])
}
