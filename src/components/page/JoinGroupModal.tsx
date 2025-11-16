"use client"
import React, { useEffect, useState } from "react";
import { Chat } from "@/types/chat";
import useAllChatRooms from "@/components/hook/useAllChatRooms";
import { Search, X, Users } from "lucide-react";
import { UserAvatar } from "../userAvatar";
import { Person } from "@/types/person";
import { apiClient } from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { useSocket } from "@/components/hook/useSocket";

// Component to display group member preview
const GroupMemberPreview = ({ groupId }: { groupId: number }) => {
  const { data: session } = useSession();
  const { socket, currentGroupUser } = useSocket(session?.idToken);
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket || !groupId) return;

    setLoading(true);

    // Listen for chat_member events
    const handleChatMember = (memberData: Person[]) => {
      console.log("Received chat members:", memberData);
      setMembers(memberData || []);
      setLoading(false);
    };
    console.log("Requesting members for groupId:", groupId);
    // Request group members via socket
    socket.emit("chat_member", groupId);

    // Listen for the response
    console.log("Listening for chat_member_update for groupId:", groupId);
    socket.on("chat_member_update", handleChatMember);
    return () => {
      console.log("Stopping listening for chat_member_update for groupId:", groupId);
      socket.off("chat_member_update", handleChatMember);
    };
  }, [socket, groupId]);

  // Also update when currentGroupUser changes (for current active room)
  useEffect(() => {
    if (currentGroupUser && currentGroupUser.length > 0) {
      setMembers(currentGroupUser);
      setLoading(false);
    }
  }, [currentGroupUser]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/60 text-xs">
        <Users size={14} />
        <span>Loading members...</span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex items-center gap-2 text-white/60 text-xs">
        <Users size={14} />
        <span>No members</span>
      </div>
    );
  }

  const displayedMembers = members.slice(0, 5);
  const remainingCount = Math.max(0, members.length - 5);

  return (
    <div className="flex items-center gap-2">
      <Users size={14} className="text-white/60" />
      <div className="flex items-center gap-1">
        <div className="flex -space-x-2">
          {displayedMembers.map((member, index) => (
            <div
              key={member.uid || index}
              className="border-2 border-purple-600 rounded-full"
              style={{ zIndex: displayedMembers.length - index }}
            >
              <UserAvatar
                name={member.given_name || member.display_name || 'Unknown'}
                isOnline={member.status === 'online'}
                size="xs"
              />
            </div>
          ))}
        </div>
        {remainingCount > 0 && (
          <span className="text-xs text-white/80 ml-2 font-medium">
            +{remainingCount}
          </span>
        )}
        <span className="text-xs text-white/60 ml-1">
          ({members.length} member{members.length !== 1 ? 's' : ''})
        </span>
      </div>
    </div>
  );
};

const JoinGroupModal = ({
  isOpen,
  onClose,
  onJoinGroup,
  groupRooms,
}: {
  isOpen: boolean
  onClose: () => void
  onJoinGroup: (groupCode: number) => void
  groupRooms: Chat[]
}) => {
  const { allChats, loading, error } = useAllChatRooms()
  const [searchTerm, setSearchTerm] = useState("")

  if (!isOpen) return null

  const existingCids = new Set((groupRooms.filter(val=>val.is_own) || []).map((r: Chat) => r.cid))
  const groups = (allChats || []).filter((c: Chat) => !!c.is_groupchat && !existingCids.has(c.cid) && !c.is_own)
  const filtered = groups.filter((g: Chat) => (g.name || `Channel ${g.cid}`).toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-purple-600 border-2 border-purple-500 rounded-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-white">Join a Channel</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-white/50" size={18} />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-purple-700 border border-purple-500 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner mr-2" />
            <span className="text-white">Loading channels...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-white/90">No channels available</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filtered.map((room: Chat) => (
              <div key={room.cid} className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-500/20 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <UserAvatar name={room.name || `Channel ${room.cid}`} isOnline={false} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{room.name || `Channel ${room.cid}`}</div>
                    <div className="text-xs text-white/60 mb-1">ID: {room.cid}</div>
                    <GroupMemberPreview groupId={room.cid} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onJoinGroup(room.cid)
                      onClose()
                    }}
                    className="px-3 py-1 rounded bg-white text-purple-700 font-medium text-sm hover:bg-white/80 transition-colors"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JoinGroupModal