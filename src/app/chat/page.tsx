"use client"
import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useSticker } from "@/components/sticker"
import OnlineUsersPanel from "@/components/page/UsersPanel"
import ChatSection from "@/components/page/ChatSection"
import { useSocket } from "@/components/hook/useSocket"
import { useChatRooms } from "@/components/hook/useChatRooms"
import { useCurrentUser } from "@/components/hook/useCurrentUser"

export default function ChatRoom() {
    const { data } = useSession()
    const searchParams = useSearchParams()
    const roomId = searchParams.get("roomId")

    const [activeRoom, setActiveRoom] = useState(roomId ? parseInt(roomId) : 1)
    const { chatRooms } = useChatRooms(data?.idToken)
    const {
        socket,
        allUsers,
        userCount,
        messages,
    } = useSocket(data?.idToken)

    // Initialize sticker functionality
    const activeRoomData = chatRooms.find((r) => r.cid === activeRoom)
    const {
        openModal: openStickerModal,
    } = useSticker({
        token: data?.idToken,
        roomId: activeRoomData?.cid,
        onStickerSent: (sticker) => {
            console.log("Sticker sent:", sticker)
        },
    })

    // Get current user and other users
    const { currentUser, otherUsers } = useCurrentUser(allUsers, data?.user)

    return (
        <div className="flex gap-4 h-full">
            {/* Chat Area */}
            <ChatSection
                activeRoomData={activeRoomData}
                openStickerModal={openStickerModal}
                socket={socket}
                currentUser={currentUser}
                messages={messages}
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
    )
}
