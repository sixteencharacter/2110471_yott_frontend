"use client"
import React, { useState } from "react"
import { useSession } from "next-auth/react"
import UsersPanel from "@/components/page/UsersPanel"
import { useSocket } from "@/components/hook/useSocket"
import { useCurrentUser } from "@/components/hook/useCurrentUser"

// Main Chat Rooms Page
export default function YOTTChatRooms() {
    const { data } = useSession()
    const {
        socket,
        allUsers,
        userCount,
    } = useSocket(data?.idToken)

    // Get current user and other users
    const { currentUser, otherUsers } = useCurrentUser(allUsers, data?.user)

    return (
        <div className="flex gap-4 h-full">
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
                <UsersPanel
                    allUsers={otherUsers}
                    userCount={userCount}
                    currentUser={currentUser}
                />
            </div>
        </div>
    )
}

