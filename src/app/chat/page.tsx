"use client"
import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { YOTTLoading } from "@/components/loading"
import { StickerModal, useSticker } from "@/components/sticker"
import Sidebar from "@/components/page/Sidebar"
import OnlineUsersPanel from "@/components/page/OnlineUsersPanel"
import ChatSection from "@/components/page/ChatSection"
import CreateDMModal from "@/components/page/CreateDMModal"
import { useSocket } from "@/components/hook/useSocket"
import { useChatRooms } from "@/components/hook/useChatRooms"
import { useOnlineUsers } from "@/components/hook/useOnlineUsers"
import { useCreateDM } from "@/components/hook/useCreateDM"

export default function ChatRoom() {
    const { data, update, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const roomId = searchParams.get("roomId")

    console.log("Chat Room - Status:", status, "RoomId:", roomId)

    const [activeRoom, setActiveRoom] = useState(roomId ? parseInt(roomId) : 1)
    const [showCreateDM, setShowCreateDM] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const { chatRooms, isInited } = useChatRooms(data?.idToken)
    const { socket, onlineUsers, userCount } = useSocket(data?.idToken)

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

    // ...existing code...

    // Transform online users for CreateDM modal, excluding current user
    const availableUsers = useOnlineUsers(onlineUsers, data?.user)

    const handleCreateDM = useCreateDM(socket, chatRooms, setActiveRoom)

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
