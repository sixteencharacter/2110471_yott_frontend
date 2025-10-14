"use client";
import React, { useState, useEffect } from "react";
import {
    LogOut,
    Plus,
    MessageCircle,
    Users,
    Search,
    X,
    Hash,
    Lock,
    Play,
    Smile,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { YOTTLoading } from "@/components/loading";
import { apiClient } from "@/lib/apiClient";
import { StickerModal, useSticker } from "@/components/sticker";
import { io, Socket } from "socket.io-client";
// User Avatar Component
const UserAvatar = ({
    name,
    isOnline = false,
    size = "md",
}: {
    name: string;
    isOnline: boolean;
    size: string;
}) => {
    const sizeClasses: Record<string, string> = {
        xs: "w-6 h-6 text-xs",
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-lg",
        xl: "w-14 h-14 text-lg",
    };

    const bgColors = [
        "bg-purple-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-pink-400",
        "bg-orange-400",
        "bg-red-400",
        "bg-indigo-400",
        "bg-cyan-400",
    ];

    const colorIndex = name.charCodeAt(0) % bgColors.length;
    const initials = name.charAt(0).toUpperCase();

    return (
        <div className="relative">
            <div
                className={`${sizeClasses[size]} ${bgColors[colorIndex]} rounded-full flex items-center justify-center font-bold text-white`}
            >
                {initials}
            </div>
            {isOnline ? (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            ) : (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full" />
            )}
        </div>
    );
};

// Create Direct Message Modal
const CreateDMModal = ({
    isOpen,
    onClose,
    onCreateDM,
    allUsers,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateDM: (user: any) => void;
    allUsers: any[];
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = allUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-purple-600 border-2 border-purple-500 rounded-lg w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold text-white">
                        New Direct Message
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="relative">
                    <Search
                        className="absolute left-3 top-3 text-white/50"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-purple-700 border border-purple-500 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white"
                    />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <p className="text-center text-white/70 py-4">
                            No users found
                        </p>
                    ) : (
                        filtered.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => {
                                    onCreateDM(user);
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-purple-500 rounded-lg transition text-left"
                            >
                                <UserAvatar
                                    name={user.name}
                                    isOnline={user.isOnline}
                                    size="md"
                                />
                                <div className="flex-1">
                                    <p className="text-white font-serif font-semibold">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-white/60">
                                        {user.isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Online Users Panel
// Online Users Panel
const OnlineUsersPanel = ({
    onlineUsers,
    userCount,
    currentUser,
}: {
    onlineUsers: any[];
    userCount: number;
    currentUser?: any;
}) => {
    const uniqueUsers = React.useMemo(() => {
        const userMap = new Map();
        onlineUsers.forEach((user) => {
            // ใช้ keycloak_id หรือ username เป็น key
            const key = user.username;
            if (key && !userMap.has(key)) {
                userMap.set(key, user);
            }
        });

        // Filter out current user from the online users list to prevent duplication
        const filteredUsers = Array.from(userMap.values()).filter((user) => {
            if (!currentUser) return true;

            // Try multiple fields to match the current user
            return !(
                user.username === currentUser.name ||
                user.display_name === currentUser.name ||
                user.name === currentUser.name ||
                user.email === currentUser.email ||
                user.username === currentUser.username
            );
        });

        return filteredUsers;
    }, [onlineUsers, currentUser]);
    return (
        <div className="bg-purple-500/20 border border-purple-300 rounded-lg p-4 space-y-4 h-full overflow-y-auto">
            <h3 className="text-lg font-serif font-bold text-black flex items-center gap-2 sticky top-0">
                <Users size={20} className="text-purple-400" />
                Online (
                {currentUser ? uniqueUsers.length + 1 : uniqueUsers.length})
            </h3>
            <div className="space-y-3">
                {/* Current User (Me) - Always at top */}
                {currentUser && (
                    <div className="flex items-center gap-3 bg-purple-400/30 p-2 rounded border-2 border-purple-400">
                        <UserAvatar
                            name={currentUser.name || "User"}
                            isOnline={true}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-purple-600 font-serif text-sm font-semibold truncate">
                                {currentUser.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-purple-500">(me)</p>
                        </div>
                    </div>
                )}

                {/* Other Online Users */}
                {uniqueUsers.length === 0 ? (
                    <div className="text-center text-purple-600 py-4">
                        {!currentUser && "ไม่มีผู้ใช้ออนไลน์"}
                    </div>
                ) : (
                    uniqueUsers.map((user, index) => (
                        <div
                            key={`${
                                user.keycloak_id || user.username
                            }-${index}`}
                            className="flex items-center gap-3 hover:bg-purple-400/20 p-2 rounded transition cursor-pointer"
                        >
                            <UserAvatar
                                name={user.username || user.display_name}
                                isOnline={true}
                                size="sm"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-purple-600 font-serif text-sm font-semibold truncate">
                                    {user.username}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Chat Room Item
const ChatRoomItem = ({
    room,
    isActive,
    onClick,
}: {
    room: any;
    isActive: boolean;
    onClick: () => void;
}) => {
    const isGroup = room.type === "group";

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                isActive
                    ? "bg-purple-400 text-white"
                    : "text-white/70 hover:bg-purple-400/30 hover:text-white"
            }`}
        >
            {isGroup ? (
                <Hash size={18} className="flex-shrink-0" />
            ) : (
                <Lock size={18} className="flex-shrink-0" />
            )}
            <span className="font-serif font-semibold truncate flex-1">
                {room.name}
            </span>
            {room.unread > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {room.unread}
                </div>
            )}
        </button>
    );
};

// Main Chat Rooms Page
export default function YOTTChatRooms() {
    const { data, update, status } = useSession();
    const [activeRoom, setActiveRoom] = useState(1);
    const [showCreateDM, setShowCreateDM] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [isInited, setInited] = useState<boolean>(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [userCount, setUserCount] = useState<number>(0);

    // Initialize socket connection
    useEffect(() => {
        if (status !== "authenticated" || !data?.idToken) return;

        const socketConnection = io("http://localhost:8000", {
            // เพิ่ม options เพื่อให้ socket reconnect อัตโนมัติ
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 50000,
        });
        setSocket(socketConnection);

        // Socket event listeners
        socketConnection.on("connect", () => {
            console.log("Connected to server");
        });

        socketConnection.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        socketConnection.on("sent_token", () => {
            console.log("Token sent to server");
            socketConnection.emit("authenticate", { token: data.idToken });
            console.log("Authenticating with token:", data.idToken);
        });

        socketConnection.on("error", (error) => {
            console.error("Socket error:", error);
        });

        // Online users update event listener
        socketConnection.on("online_users_update", (data) => {
            console.log("อัพเดตรายชื่อผู้ใช้:", data);

            // อัพเดตจำนวนคน
            setUserCount(data.total_count);

            // อัพเดตรายชื่อผู้ใช้
            setOnlineUsers(data.users || []);
        });

        // Cleanup on component unmount
        return () => {
            socketConnection.disconnect();
        };
    }, [status, data?.idToken]); // เพิ่ม dependency

    // Initialize sticker functionality
    const activeRoomData = chatRooms.find((r) => r.id === activeRoom);
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
            console.log("Sticker sent:", sticker);
        },
    });

    // Chat room fetch effect
    React.useEffect(() => {
        if (status == "authenticated") {
            (async () => {
                const res = await apiClient.get("/v1/chat", {
                    headers: {
                        Authorization: `Bearer ${data?.idToken}`,
                    },
                });
                setChatRooms(res.data);
                setInited(true);
            })();
        }
    }, [status]);

    // Transform online users for CreateDM modal, excluding current user
    const availableUsers = React.useMemo(() => {
        return onlineUsers
            .filter((user) => {
                // Filter out current user from DM creation list
                if (!data?.user) return true;

                return !(
                    user.username === data.user.name ||
                    user.display_name === data.user.name ||
                    user.name === data.user.name ||
                    user.email === data.user.email
                );
            })
            .map((user, index) => ({
                id: user.keycloak_id || user.username || index,
                name: user.username || user.display_name || "Unknown User",
                isOnline: true, // All users in onlineUsers are online
            }));
    }, [onlineUsers, data?.user]);

    const handleCreateDM = (user: any) => {
        const existingDM = chatRooms.find(
            (room) => room.name === user.name && room.type === "private"
        );

        if (!existingDM) {
            const newDM = {
                id: chatRooms.length + 1,
                name: user.name,
                type: "private",
                lastMessage: "No messages yet",
                unread: 0,
            };
            setChatRooms([...chatRooms, newDM]);
            setActiveRoom(newDM.id);
        } else {
            setActiveRoom(existingDM.id);
        }
    };

    const filteredRooms = chatRooms.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupRooms = filteredRooms.filter((r) => r.type === "group");
    const privateRooms = filteredRooms.filter((r) => r.type === "private");

    return (
        <div className="h-screen flex bg-purple-200 gap-4 p-4">
            <YOTTLoading show={!isInited} />
            {/* Sidebar */}
            <div className="w-72 bg-purple-500/90 rounded-lg flex flex-col shadow-lg">
                {/* Header */}
                <div className="border-b border-purple-500 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-serif font-bold text-white">
                            YOTT
                        </h1>
                        <button
                            onClick={() => signOut()}
                            className="p-2 hover:bg-purple-500 rounded-lg transition text-white/70 hover:text-white"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>

                    {/* Search and Create */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-3 text-white/50"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-purple-500 border border-purple-400 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white text-sm"
                            />
                        </div>

                        <button
                            onClick={() => setShowCreateDM(true)}
                            className="w-full flex items-center justify-center gap-2 bg-purple-400 hover:bg-purple-300 text-white font-serif py-2 rounded-lg transition-all duration-300"
                        >
                            <Plus size={18} />
                            Direct Message
                        </button>
                    </div>
                </div>

                {/* Chat Rooms */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {/* Group Chats */}
                    {groupRooms.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-serif font-bold text-white/60 uppercase tracking-wider px-2 py-1">
                                Channels
                            </h3>
                            <div className="space-y-1">
                                {groupRooms.map((room) => (
                                    <ChatRoomItem
                                        key={room.id}
                                        room={room}
                                        isActive={activeRoom === room.id}
                                        onClick={() => setActiveRoom(room.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Private Messages */}
                    {privateRooms.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-serif font-bold text-white/60 uppercase tracking-wider px-2 py-1">
                                Direct Messages
                            </h3>
                            <div className="space-y-1">
                                {privateRooms.map((room) => (
                                    <ChatRoomItem
                                        key={room.id}
                                        room={room}
                                        isActive={activeRoom === room.id}
                                        onClick={() => setActiveRoom(room.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredRooms.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-white/60 font-serif">
                                No rooms found
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-4">
                {/* Chat Area */}
                <div className="flex-1 bg-purple-100 rounded-lg shadow-lg flex flex-col">
                    {activeRoomData && (
                        <>
                            {/* Room Header */}
                            <div className="border-b border-purple-300 p-4 bg-white rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    {activeRoomData.type === "group" ? (
                                        <Hash
                                            className="text-purple-600"
                                            size={24}
                                        />
                                    ) : (
                                        <Lock
                                            className="text-purple-600"
                                            size={24}
                                        />
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
                                        onClick={() => openStickerModal()}
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
    );
}
