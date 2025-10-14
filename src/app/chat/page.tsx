"use client";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Plus, LogOut, MessageCircle } from "lucide-react";

export default function ChatHome() {
    const { data, status } = useSession();
    const [chatRooms, setChatRooms] = useState([
        { id: 1, name: "General", lastMessage: "Welcome to General chat!" },
        {
            id: 2,
            name: "Tech Talk",
            lastMessage: "Discussing the latest in tech.",
        },
        { id: 3, name: "Random", lastMessage: "Share anything here!" },
    ]);

    return (
        <div className="h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-indigo-600 text-white flex flex-col">
                <div className="p-4 border-b border-indigo-500">
                    <h1 className="text-2xl font-bold">Chat App</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ul>
                        {chatRooms.map((room) => (
                            <li
                                key={room.id}
                                className="p-4 hover:bg-indigo-500 cursor-pointer border-b border-indigo-500"
                            >
                                <div className="font-semibold">{room.name}</div>
                                <div className="text-sm text-indigo-200 truncate">
                                    {room.lastMessage}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 border-t border-indigo-500">
                    <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 bg-white shadow-md flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        Welcome, {data?.user?.name || "User"}!
                    </h2>
                    <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                        <Plus size={18} /> New Chat
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <MessageCircle size={48} className="text-indigo-300" />
                    <p className="text-xl text-indigo-500 ml-4">
                        Select a chat room to start messaging!
                    </p>
                </div>
            </div>
        </div>
    );
}
