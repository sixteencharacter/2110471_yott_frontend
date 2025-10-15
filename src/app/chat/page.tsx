"use client"
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { YOTTLoading } from "@/components/loading"
import { apiClient } from "@/lib/apiClient"
import { StickerModal, useSticker } from "@/components/sticker"
import { io, Socket } from "socket.io-client"
import Sidebar from "@/components/Sidebar"
import OnlineUsersPanel from "@/components/OnlineUsersPanel"
import ChatSection from "@/components/ChatSection"
import CreateDMModal from "@/components/CreateDMModal"

export default function ChatRoom() {
    const { data, update, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const roomId = searchParams.get("roomId")

    console.log("Chat Room - Status:", status, "RoomId:", roomId)

    const [activeRoom, setActiveRoom] = useState(roomId ? parseInt(roomId) : 1)
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
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 50000,
        })
        setSocket(socketConnection)

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

        socketConnection.on("online_users_update", (data) => {
            console.log("อัพเดตรายชื่อผู้ใช้:", data)
            setUserCount(data.total_count)
            setOnlineUsers(data.users || [])
        })

        return () => {
            socketConnection.disconnect()
        }
    }, [status, data?.idToken])

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
        console.log(
            "Chat Room useEffect - Status:",
            status,
            "Token:",
            !!data?.idToken
        )
        if (status == "authenticated") {
            ;(async () => {
                try {
                    const res = await apiClient.get("/v1/chat", {
                        headers: {
                            Authorization: `Bearer ${data?.idToken}`,
                        },
                    })
                    setChatRooms(res.data)
                    setInited(true)
                } catch (error) {
                    console.error(
                        "Failed to fetch chat rooms in chat page:",
                        error
                    )
                    setInited(true)
                }
            })()
        }
    }, [status])

    // Transform online users for CreateDM modal, excluding current user
    const availableUsers = React.useMemo(() => {
        return onlineUsers
            .filter((user) => {
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
                isOnline: true,
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

    // Handle room selection within chat page
    const handleRoomSelect = (roomId: number) => {
        setActiveRoom(roomId)
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
                {/* Chat Area */}
                <ChatSection
                    activeRoomData={activeRoomData}
                    openStickerModal={openStickerModal}
                />

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
