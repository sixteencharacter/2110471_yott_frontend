import { useEffect, useState, useMemo } from "react"
import { Person } from "@/types/person"
import { apiClient } from "@/lib/apiClient"

// Options for different use cases
interface UseOnlineUsersOptions {
    token?: string
    roomId?: number
    fetchGroupUsers?: boolean
}

export function useOnlineUsers(
    allUsers: Person[],
    currentUser: Person | null,
    options?: UseOnlineUsersOptions
) {
    const [groupUsers, setGroupUsers] = useState<Person[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch group users if requested
    useEffect(() => {
        if (!options?.fetchGroupUsers || !options?.token || !options?.roomId) {
            setGroupUsers(allUsers)
            return
        }

        const fetchGroupUsers = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await apiClient.get(
                    `/v1/chats/${options.roomId}/members`,
                    {
                        headers: { Authorization: `Bearer ${options.token}` },
                    }
                )

                const backendUsers = response.data.map((user: any) => ({
                    uid: user.uid,
                    given_name: user.given_name,
                    family_name: user.family_name,
                    display_name: user.preferred_username,
                    email: user.email,
                    status: "offline", // Default status, will be updated from allUsers
                }))

                // Merge with allUsers to get real-time status
                const usersWithStatus = backendUsers.map(
                    (backendUser: Person) => {
                        const socketUser = allUsers?.find(
                            (socketUser: Person) =>
                                socketUser.uid === backendUser.uid ||
                                socketUser.display_name ===
                                    backendUser.display_name ||
                                socketUser.email === backendUser.email
                        )

                        return {
                            ...backendUser,
                            status: socketUser?.status || "offline",
                        }
                    }
                )

                setGroupUsers(usersWithStatus)
            } catch (err) {
                console.error("Error fetching group users:", err)
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch group users"
                )
                setGroupUsers([])
            } finally {
                setLoading(false)
            }
        }

        fetchGroupUsers()
    }, [options?.token, options?.roomId, options?.fetchGroupUsers, allUsers])

    // Process users based on whether we're fetching group users or using all users
    const processedUsers = useMemo(() => {
        const usersToProcess = options?.fetchGroupUsers ? groupUsers : allUsers

        return usersToProcess
            .filter((user) => {
                if (!currentUser) return true
                return !(
                    user.uid === currentUser.uid ||
                    user.given_name === currentUser.given_name ||
                    user.display_name === currentUser.display_name ||
                    user.email === currentUser.email
                )
            })
            .map((user, index) => ({
                id: user.uid || user.given_name || index,
                name: user.given_name || user.display_name || "Unknown User",
                isOnline: user.status === "online",
                ...user, // Include all original user properties
            }))
    }, [allUsers, currentUser, groupUsers, options?.fetchGroupUsers])

    return {
        users: processedUsers,
        rawUsers: options?.fetchGroupUsers ? groupUsers : allUsers,
        loading,
        error,
        refetch: () => {
            if (options?.fetchGroupUsers && options?.token && options?.roomId) {
                // Trigger re-fetch by updating state
                setLoading(true)
            }
        },
    }
}
