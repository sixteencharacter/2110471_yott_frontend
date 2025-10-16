"use client"
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { YOTTLoading } from "@/components/loading"
import { apiClient } from "@/lib/apiClient"
import { StickerModal, useSticker } from "@/components/sticker"
import { io, Socket } from "socket.io-client"
import Sidebar from "@/components/Sidebar"
import OnlineUsersPanel from "@/components/OnlineUsersPanel"
import ChatSection from "@/components/ChatSection"
import CreateDMModal from "@/components/CreateDMModal"

// Component definitions moved to separate files

// Main Chat Rooms Page
export default function YOTTChatRooms() {
    const { data, update, status } = useSession()
    const router = useRouter()
    const [activeRoom, setActiveRoom] = useState(1)
    const [showCreateDM, setShowCreateDM] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [chatRooms, setChatRooms] = useState<any[]>([])
    const [isInited, setInited] = useState<boolean>(false)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<any[]>([])
    const [userCount, setUserCount] = useState<number>(0)

    // Initialize socket connection
    useEffect(() => {
        if (status !== "authenticated" || !data?.idToken) return

        const socketConnection = io("http://localhost:8000", {
            // เพิ่ม options เพื่อให้ socket reconnect อัตโนมัติ
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 50000,
        })
        setSocket(socketConnection)

        // Socket event listeners
        socketConnection.on("connect", () => {
            console.log("Connected to server")
        })

        socketConnection.on("disconnect", () => {
            console.log("Disconnected from server")
        })

        socketConnection.on("sent_token", () => {
            console.log("Token sent to server")
            socketConnection.emit("authenticate", { token: data.idToken })
            console.log("Authenticating with token:", data.idToken)
        })

        socketConnection.on("error", (error) => {
            console.error("Socket error:", error)
        })

        // Online users update event listener
        socketConnection.on("online_users_update", (data) => {
            console.log("อัพเดตรายชื่อผู้ใช้:", data)

            // อัพเดตจำนวนคน
            setUserCount(data.total_count)

            // อัพเดตรายชื่อผู้ใช้
            setOnlineUsers(data.users || [])
        })

        // Cleanup on component unmount
        return () => {
            socketConnection.disconnect()
        }
    }, [status, data?.idToken]) // เพิ่ม dependency

    // Initialize sticker functionality
    const activeRoomData = chatRooms.find((r) => r.id === activeRoom)
    const {
        stickerPacks,
        selectedPack,
        setSelectedPack,
        showModal: showStickerModal,
        openModal: openStickerModal,
        closeModal: closeStickerModal,
        handleSelectSticker,
        loading: stickerLoading,
        error: stickerError,
    } = useSticker({
        token: data?.idToken,
        roomId: activeRoomData?.id,
        onStickerSent: (sticker) => {
            console.log("Sticker sent:", sticker)
        },
    })

    // Chat room fetch effect
    React.useEffect(() => {
        if (status == "authenticated") {
            ;(async () => {
                const res = await apiClient.get(`/v1/user/chats`, {
                    headers: {
                        Authorization: `Bearer ${data?.idToken}`,
                    },
                })
                console.log("Fetched chat rooms:", res)
                setChatRooms(res.data)
                setInited(true)
            })()
        }
    }, [status])

    // Transform online users for CreateDM modal, excluding current user
    const availableUsers = React.useMemo(() => {
        return onlineUsers
            .filter((user) => {
                // Filter out current user from DM creation list
                if (!data?.user) return true

                return !(
                    user.username === data.user.name ||
                    user.display_name === data.user.name ||
                    user.name === data.user.name ||
                    user.email === data.user.email
                )
            })
            .map((user, index) => ({
                id: user.keycloak_id || user.username || index,
                name: user.username || user.display_name || "Unknown User",
                isOnline: true, // All users in onlineUsers are online
            }))
    }, [onlineUsers, data?.user])

    const handleCreateDM = (user: any) => {
        const existingDM = chatRooms.find(
            (room) => room.name === user.name && room.type === "private"
        )

        if (!existingDM) {
            const newDM = {
                id: chatRooms.length + 1,
                name: user.name,
                type: "private",
                lastMessage: "No messages yet",
                unread: 0,
            }
            setChatRooms([...chatRooms, newDM])
            setActiveRoom(newDM.id)
        } else {
            setActiveRoom(existingDM.id)
        }
    }

    const filteredRooms = chatRooms.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const groupRooms = filteredRooms.filter((r) => r.type === "group")
    const privateRooms = filteredRooms.filter((r) => r.type === "private")

    // Handle room selection - navigate to chat page
    const handleRoomSelect = (roomId: number) => {
        router.push(`/chat?roomId=${roomId}`)
    }

    return (
        <div className="h-screen flex bg-purple-200 gap-4 p-4">
            <YOTTLoading show={!isInited} />

            {/* Sidebar */}
            <Sidebar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showCreateDM={showCreateDM}
                setShowCreateDM={setShowCreateDM}
                groupRooms={groupRooms}
                privateRooms={privateRooms}
                activeRoom={activeRoom}
                setActiveRoom={handleRoomSelect}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex gap-4">
                {/* Welcome Area */}
                <div className="flex-1 bg-purple-100 rounded-lg shadow-lg flex flex-col">
                    <div className="border-b border-purple-300 p-4 bg-white rounded-t-lg">
                        <h2 className="text-2xl font-serif font-bold text-purple-900">
                            Welcome to YOTT Chat
                        </h2>
                        <p className="text-sm text-purple-600">
                            Select a room from the sidebar to start chatting
                        </p>
                    </div>

                    <div className="flex-1 p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <p className="text-xl text-purple-600 font-serif mb-2">
                                Ready to Chat?
                            </p>
                            <p className="text-purple-500">
                                Choose a channel or direct message to get
                                started
                            </p>
                        </div>
                    </div>
                </div>

                {/* Online Users Panel */}
                <div className="w-80 bg-white rounded-lg shadow-lg">
                    <OnlineUsersPanel
                        onlineUsers={onlineUsers}
                        userCount={userCount}
                        currentUser={data?.user}
                    />
                </div>
            </div>

            {/* Create DM Modal */}
            <CreateDMModal
                isOpen={showCreateDM}
                onClose={() => setShowCreateDM(false)}
                onCreateDM={handleCreateDM}
                allUsers={availableUsers}
            />

            {/* Sticker Modal */}
            <StickerModal
                isOpen={showStickerModal}
                onClose={closeStickerModal}
                onSelectSticker={handleSelectSticker}
                stickerPacks={stickerPacks}
                selectedPack={selectedPack}
                onPackChange={setSelectedPack}
            />
        </div>
    )
}
