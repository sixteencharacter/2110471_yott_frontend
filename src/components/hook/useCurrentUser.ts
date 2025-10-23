import { Person } from "@/types/person"
import { useState, useEffect } from "react"

export function useCurrentUser(allUsers: Person[], sessionUser: any) {
    const [currentUser, setCurrentUser] = useState<Person | null>(null)
    const [otherUsers, setOtherUsers] = useState<Person[]>([])

    useEffect(() => {
        if (!sessionUser || !allUsers?.length) {
            setCurrentUser(null)
            setOtherUsers(allUsers || [])
            return
        }

        // Find current user
        const match = allUsers.find((user: Person) => {
            return (
                user.uid === sessionUser.uid ||
                user.username === sessionUser.username ||
                user.display_name === sessionUser.display_name ||
                user.email === sessionUser.email
            )
        })

        setCurrentUser(match || null)

        // Filter other users (excluding current user)
        const others = allUsers.filter((user: Person) => {
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
