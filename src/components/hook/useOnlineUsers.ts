import { useMemo } from "react"

export function useOnlineUsers(onlineUsers: any[], currentUser: any) {
    return useMemo(() => {
        return onlineUsers
            .filter((user) => {
                if (!currentUser) return true
                // console.log("Current user:", currentUser, user)
                // console.log(
                //     !(
                //         user.keycloak_id === currentUser.keycloak_id ||
                //         user.username === currentUser.username ||
                //         user.display_name === currentUser.display_name ||
                //         user.email === currentUser.email
                //     )
                // )
                return !(
                    user.keycloak_id === currentUser.keycloak_id ||
                    user.username === currentUser.username ||
                    user.display_name === currentUser.display_namename ||
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
