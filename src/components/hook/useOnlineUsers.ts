import { useMemo } from "react"

export function useOnlineUsers(onlineUsers: any[], currentUser: any) {
    return useMemo(() => {
        return onlineUsers
            .filter((user) => {
                if (!currentUser) return true
                console.log("Current user:", currentUser, user)
                return !(
                    user.username === currentUser.name ||
                    user.display_name === currentUser.name ||
                    user.name === currentUser.name ||
                    user.email === currentUser.email
                )
            })
            .map((user, index) => ({
                id: user.keycloak_id || user.username || index,
                name: user.username || user.display_name || "Unknown User",
                isOnline: true,
            }))
    }, [onlineUsers, currentUser])
}
