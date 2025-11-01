import { Chat } from "@/types/chat"
import { Person } from "@/types/person"
import { send } from "process"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

export function useSocket(token?: string) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [allUsers, setAllUsers] = useState<Person[]>([])
    const [currentGroupUser , setcurrentGroupUser] = useState<Person[]>([]);
    const [socketError, setSocketError] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [availableChat,setAvailableChat] = useState<Chat[]>([]);
    const [chatInited,setChatInited] = useState<boolean>(false);

    useEffect(() => {
        if (!token) return
        const socketConnection = io("http://localhost:8000", {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 50000,
            extraHeaders: {
                Authorization: `Bearer ${token}`,
            },
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
            setAllUsers(data.users || [])
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
        socketConnection.on("handle_1_dm_exists", (data) => {
            console.log("DM exists:", data)
            setSocketError("A direct message with this user already exists!")
        })
        socketConnection.on("chat_creation_error", (error) => {
            console.error("Chat creation error:", error)
            setSocketError(error.message || "Failed to create chat")
        })
        socketConnection.on("receive_msg", (messageData) => {
            console.log("Received message:", messageData)
            setMessages((prev) => [...prev, messageData])
        })
        socketConnection.on("chat_member_update",(messagedata)=>{
            setcurrentGroupUser(messagedata);
        })

        socketConnection.on("available_chat",(messageData)=>{
            setChatInited(true)
            setAvailableChat((val)=>((val?.length ?? 0) > messageData.length)? val : messageData)
        })

        return () => {
            socketConnection.disconnect()
        }
    }, [token])

    // Auto-clear error after 5 seconds
    useEffect(() => {
        if (socketError) {
            const timer = setTimeout(() => {
                setSocketError(null)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [socketError])

    // Function to clear error
    const clearSocketError = () => setSocketError(null)

    return {
        socket,
        allUsers,
        socketError,
        clearSocketError,
        messages,
        currentGroupUser,
        availableChat,
        chatInited
    }
}
