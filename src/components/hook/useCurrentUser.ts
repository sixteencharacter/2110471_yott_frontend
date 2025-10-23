import { useState, useEffect } from "react"

export function useCurrentUser(allUsers: any[], sessionUser: any) {
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [otherUsers, setOtherUsers] = useState<any[]>([])

    useEffect(() => {
        if (!sessionUser || !allUsers?.length) {
            setCurrentUser(null)
            setOtherUsers(allUsers || [])
            return
        }

        // Find current user
        const match = allUsers.find((user: any) => {
            return (
                user.username === sessionUser.name ||
                user.display_name === sessionUser.name ||
                user.name === sessionUser.name ||
                user.email === sessionUser.email
            )
        })

        setCurrentUser(match || null)

        // Filter other users (excluding current user)
        const others = allUsers.filter((user: any) => {
            if (!match) return true
            return !(
                user.uid === match.uid ||
                user.username === match.username ||
                user.display_name === match.display_name ||
                user.email === match.email
            )
        })
        setOtherUsers(others)
    }, [allUsers, sessionUser])

    return { currentUser, otherUsers }
}
