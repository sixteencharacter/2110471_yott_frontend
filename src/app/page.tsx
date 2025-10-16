"use client"
import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { YOTTLoading } from "@/components/loading"
import { StickerModal, useSticker } from "@/components/sticker"
import Sidebar from "@/components/page/Sidebar"
import OnlineUsersPanel from "@/components/page/OnlineUsersPanel"
import ChatSection from "@/components/page/ChatSection"
import CreateDMModal from "@/components/page/CreateDMModal"
import { useSocket } from "@/components/hook/useSocket"
import { useChatRooms } from "@/components/hook/useChatRooms"
import { useOnlineUsers } from "@/components/hook/useOnlineUsers"

// Component definitions moved to separate files

// Main Chat Rooms Page
export default function YOTTChatRooms() {
    const { data, update, status } = useSession()
    const router = useRouter()
    const [activeRoom, setActiveRoom] = useState(1)
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

    const handleCreateDM = (user: any) => {
        const existingDM = chatRooms.find(
            (room) => room.name === user.name && room.type === "private"
        )

        if (!existingDM) {
            // Local state update for new DM (since chatRooms is now from hook)
            // You may want to handle DM creation via API in a real app
            setActiveRoom(chatRooms.length + 1)
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
