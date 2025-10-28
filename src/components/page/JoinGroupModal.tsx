import React, { useEffect } from "react";
import { Chat } from "@/types/chat";
import useAllChatRooms from "@/components/hook/useAllChatRooms";

const JoinGroupModal = ({
  isOpen,
  onClose,
  onJoinGroup,
  groupRooms,
}: {
  isOpen: boolean;
  onClose: () => void; 
  onJoinGroup: (groupCode: number) => void;
  groupRooms: Chat[];
}) => {
  const { allChats, loading, error,} = useAllChatRooms()
  if (!isOpen) return null

  const existingCids = new Set((groupRooms || []).map((r: Chat) => r.cid))
  const groups = (allChats || []).filter((c: Chat) => !!c.is_groupchat && !existingCids.has(c.cid))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-96 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-lg p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Join a Channel</h2>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner mr-2" />
            <span>Loading channels...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-gray-500">No channels available</p>
        ) : (
          <div className="space-y-2">
            {groups.map((room: Chat) => (
              <div key={room.cid} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-800">{room.name || `Channel ${room.cid}`}</div>
                  <div className="text-xs text-gray-500">ID: {room.cid}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { onJoinGroup(room.cid); console.log("joingroup",room.cid); onClose() }}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
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

