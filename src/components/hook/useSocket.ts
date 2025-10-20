import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

export function useSocket(token?: string) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<any[]>([])
    const [userCount, setUserCount] = useState<number>(0)

    useEffect(() => {
        if (!token) return
        const socketConnection = io("http://localhost:8000", {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 50000,
            extraHeaders : {
                'Authorization' : `Bearer ${token}`
            }
        })
        setSocket(socketConnection)

        socketConnection.on("connect", () => {
            console.log("Connected to server")
        })
        socketConnection.on("disconnect", () => {
            console.log("Disconnected from server")
        })
        socketConnection.on("sent_token", () => {
            socketConnection.emit("authenticate", { token })
        })
        socketConnection.on("error", (error) => {
            console.error("Socket error:", error)
        })
        socketConnection.on("online_users_update", (data) => {
            console.log("Online users update:", data.users)
            setUserCount(data.total_count)
            setOnlineUsers(data.users || [])
        })
        socketConnection.on("chat_created", (chat) => {
            console.log("New chat created:", chat.cid)
        })
        socketConnection.on("user_joined", (data) => {
            console.log("User joined:", data)
        })
        socketConnection.on("user_left", (data) => {
            console.log("User left:", data)
        })
        return () => {
            socketConnection.disconnect()
        }
    }, [token])

    return { socket, onlineUsers, userCount }
}
