import { useEffect, useState } from "react"
import { Person } from "@/types/person"
import { apiClient } from "@/lib/apiClient"

export const useGroupUsers = (
    token?: string,
    roomId?: number,
    allUsers?: Person[]
) => {
    const [groupUsers, setGroupUsers] = useState<Person[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token || !roomId) return

        const fetchGroupUsers = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await apiClient.get(
                    `/v1/chats/${roomId}/members`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
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

                console.log("Group users with status:", usersWithStatus)
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
    }, [token, roomId, allUsers])

    return {
        groupUsers,
        loading,
        error,
        refetch: () => {
            if (token && roomId) {
                // Trigger re-fetch by updating dependencies
            }
        },
    }
}
