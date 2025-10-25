"use client"
import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { YOTTLoading } from "@/components/loading"
import { StickerModal, useSticker } from "@/components/sticker"
import Sidebar from "@/components/page/Sidebar"
import OnlineUsersPanel from "@/components/page/UsersPanel"
import GroupOnlineUsersPanel from "@/components/page/GroupOnlineUsersPanel"
import ChatSection from "@/components/page/ChatSection"
import CreateDMModal from "@/components/page/CreateDMModal"
import { useSocket } from "@/components/hook/useSocket"
import { useChatRooms } from "@/components/hook/useChatRooms"
import { useCreateDM } from "@/components/hook/useCreateDM"
import { useCurrentUser } from "@/components/hook/useCurrentUser"

export default function ChatRoom() {
    // Initialize page state
    const { data, update, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const roomId = searchParams.get("roomId")

    // Initialize React state - use roomId from URL
    const [activeRoom, setActiveRoom] = useState(roomId ? parseInt(roomId) : 1)
    const [showCreateDM, setShowCreateDM] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const { chatRooms, isInited, refreshChatRooms } = useChatRooms(
        data?.idToken
    )

    // Sync activeRoom with URL parameter
    React.useEffect(() => {
        if (roomId) {
            setActiveRoom(parseInt(roomId))
        }
    }, [roomId])

    // Socket Initialization
    const { socket, allUsers, socketError, clearSocketError, messages } =
        useSocket(data?.idToken)

    // Initialize sticker functionality
    const activeRoomData = chatRooms.find((r) => r.cid === activeRoom)

    // Debug log
    React.useEffect(() => {
        console.log(
            "Chat Page - activeRoom:",
            activeRoom,
            "activeRoomData:",
            activeRoomData
        )
    }, [activeRoom, activeRoomData])

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
        roomId: activeRoomData?.cid,
        onStickerSent: (sticker) => {
            console.log("Sticker sent:", sticker)
        },
    })

    // Get current user and other users
    const { currentUser, otherUsers } = useCurrentUser(allUsers, data?.user)

    const handleCreateDM = useCreateDM(
        socket,
        chatRooms,
        setActiveRoom,
        currentUser,
        refreshChatRooms
    )

    const filteredRooms = chatRooms.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const groupRooms = filteredRooms.filter((r) => r.is_groupchat === true)
    const privateRooms = filteredRooms.filter((r) => r.is_groupchat === false)

    // Handle room selection within chat page
    const handleRoomSelect = (roomId: number) => {
        if (socket) {
            socket?.emit("join_chat", roomId)
        }
        setActiveRoom(roomId)
        router.push(`/chat?roomId=${roomId}`)
    }

    React.useEffect(() => {
        if (socket && activeRoom) {
            socket.emit("join_chat", activeRoom)
        }
    }, [socket, activeRoom])

    return (
        <div className="h-full flex bg-purple-200 gap-4 p-4">
            <YOTTLoading show={!isInited} />

            {/* Error Notification */}
            {socketError && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    <div className="flex items-center gap-2">
                        <span>{socketError}</span>
                        <button
                            onClick={clearSocketError}
                            className="text-white hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex gap-4">
                {/* Chat Area */}
                <ChatSection
                    key={activeRoom} // Force re-render when room changes
                    activeRoomData={activeRoomData}
                    openStickerModal={openStickerModal}
                    socket={socket}
                    currentUser={currentUser}
                    messages={messages}
                />

                {/* Group Members Panel */}
                <GroupOnlineUsersPanel
                    token={data?.idToken}
                    roomId={activeRoom}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    groupName={activeRoomData?.name || "Group Chat"}
                />
            </div>
        </div>
    )
}
