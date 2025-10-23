"use client"
import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { YOTTLoading } from "@/components/loading"
import { StickerModal, useSticker } from "@/components/sticker"
import Sidebar from "@/components/page/Sidebar"
import OnlineUsersPanel from "@/components/page/UsersPanel"
import ChatSection from "@/components/page/ChatSection"
import CreateDMModal from "@/components/page/CreateDMModal"
import { useSocket } from "@/components/hook/useSocket"
import { useChatRooms } from "@/components/hook/useChatRooms"
import { useOnlineUsers } from "@/components/hook/useOnlineUsers"
import { useCreateDM } from "@/components/hook/useCreateDM"
import { useCurrentUser } from "@/components/hook/useCurrentUser"

export default function ChatRoom() {
    const { data, update, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const roomId = searchParams.get("roomId")

    const [activeRoom, setActiveRoom] = useState(roomId ? parseInt(roomId) : 1)
    const [showCreateDM, setShowCreateDM] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const { chatRooms, isInited, refreshChatRooms } = useChatRooms(
        data?.idToken
    )
    const { socket, allUsers, userCount, socketError, clearSocketError } =
        useSocket(data?.idToken)

    // ...existing code...

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

    // Get current user and other users
    const { currentUser, otherUsers } = useCurrentUser(allUsers, data?.user)

    // Transform online users for CreateDM modal, excluding current user
    const availableUsers = useOnlineUsers(allUsers, currentUser)

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

    const groupRooms = filteredRooms.filter((r) => r.type === "group")
    const privateRooms = filteredRooms.filter((r) => r.type === "private")

    // Handle room selection within chat page
    const handleRoomSelect = (roomId: number) => {
        if (socket) {
            socket?.emit("join_chat", roomId)
        }
        setActiveRoom(roomId)
        router.push(`/chat?roomId=${roomId}`)
    }

    return (
        <div className="h-screen flex bg-purple-200 gap-4 p-4">
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
                        allUsers={otherUsers}
                        userCount={userCount}
                        currentUser={currentUser}
                    />
                </div>
            </div>

            {/* Create DM Modal */}
            <CreateDMModal
                isOpen={showCreateDM}
                onClose={() => setShowCreateDM(false)}
                onCreateDM={handleCreateDM}
                allUsers={otherUsers}
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
