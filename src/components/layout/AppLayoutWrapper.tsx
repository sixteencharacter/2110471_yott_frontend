"use client"
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { YOTTLoading } from "@/components/loading"
import { StickerModal, useSticker } from "@/components/sticker"
import Sidebar from "@/components/page/Sidebar"
import CreateDMModal from "@/components/page/CreateDMModal"
import { useSocket } from "@/components/hook/useSocket"
import { useChatRooms } from "@/components/hook/useChatRooms"
import { useCreateDM } from "@/components/hook/useCreateDM"
import { useCurrentUser } from "@/components/hook/useCurrentUser"

interface AppLayoutWrapperProps {
    children: React.ReactNode
}

export default function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
    const { data } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    const [showCreateDM, setShowCreateDM] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeRoom, setActiveRoom] = useState(0)
    
    const { chatRooms, isInited, refreshChatRooms } = useChatRooms(
        data?.idToken
    )
    const {
        socket,
        allUsers,
        userCount,
        socketError,
        clearSocketError,
        messages,
    } = useSocket(data?.idToken)

    // Get current user and other users
    const { currentUser, otherUsers } = useCurrentUser(allUsers, data?.user)

    // Update activeRoom based on current page
    useEffect(() => {
        const roomId = searchParams.get("roomId")
        if (roomId) {
            setActiveRoom(parseInt(roomId))
        } else {
            setActiveRoom(0)
        }
    }, [searchParams])

    // Handle room selection - navigate to chat page
    const handleRoomSelect = (roomId: number) => {
        if (socket) {
            socket?.emit("join_chat", roomId)
        }
        setActiveRoom(roomId)
        router.push(`/chat?roomId=${roomId}`)
    }

    // Handle DM creation
    const handleCreateDM = useCreateDM(
        socket,
        chatRooms,
        handleRoomSelect,
        currentUser,
        refreshChatRooms
    )

    // Filter rooms based on search
    const filteredRooms = chatRooms.filter((room: any) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const groupRooms = filteredRooms.filter((r: any) => r.is_groupchat === true)
    const privateRooms = filteredRooms.filter((r: any) => r.is_groupchat === false)

    // Initialize sticker functionality (for pages that need it)
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
        roomId: 1,
        onStickerSent: (sticker: any) => {
            console.log("Sticker sent:", sticker)
        },
    })

    // Don't show layout on auth pages
    if (pathname?.startsWith('/auth/')) {
        return <>{children}</>
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
            <div className="flex-1">
                {children}
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