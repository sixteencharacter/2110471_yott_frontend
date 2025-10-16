"use client"
import React from "react"
import { Hash, Lock, Smile, Play } from "lucide-react"

export default function ChatSection({ activeRoomData, openStickerModal }: any) {
    return (
        <div className="flex-1 bg-purple-100 rounded-lg shadow-lg flex flex-col">
            {activeRoomData && (
                <>
                    {/* Room Header */}
                    <div className="border-b border-purple-300 p-4 bg-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                            {activeRoomData.type === "group" ? (
                                <Hash className="text-purple-600" size={24} />
                            ) : (
                                <Lock className="text-purple-600" size={24} />
                            )}
                            <div>
                                <p className="text-xl font-serif font-bold text-purple-900">
                                    {activeRoomData.name}
                                </p>
                                <p className="text-xs text-purple-600">
                                    {activeRoomData.lastMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Room Content Area */}
                    <div className="flex-1 p-6 flex items-center justify-center">
                        <p className="text-purple-600 font-serif text-center text-lg">
                            Welcome to {activeRoomData.name}
                        </p>
                    </div>
                    {/* Message Input */}
                    <div className="border-t border-purple-300 p-4 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 bg-purple-100 border border-purple-300 rounded-lg px-4 py-3 text-purple-900 placeholder-purple-500 focus:outline-none focus:border-purple-600"
                            />
                            <button
                                onClick={openStickerModal}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
                                title="Add Sticker"
                            >
                                <Smile size={20} />
                            </button>
                            <button className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center">
                                <Play size={20} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
