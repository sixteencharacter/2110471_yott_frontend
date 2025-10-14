"use client";
import React from "react";
import { X } from "lucide-react";
import { StickerPacks, Sticker } from "./stickerData";

interface StickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSticker: (sticker: Sticker) => void;
    stickerPacks: StickerPacks;
    selectedPack: string;
    onPackChange: (packId: string) => void;
}

export const StickerModal: React.FC<StickerModalProps> = ({
    isOpen,
    onClose,
    onSelectSticker,
    stickerPacks,
    selectedPack,
    onPackChange,
}) => {
    if (!isOpen) return null;

    const currentPack = stickerPacks[selectedPack];

    return (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-purple-600 border-2 border-purple-500 rounded-lg w-full max-w-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold text-white">
                        Stickers - {currentPack?.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Sticker Pack Tabs */}
                <div className="flex gap-2 overflow-x-auto">
                    {Object.values(stickerPacks).map((pack) => (
                        <button
                            key={pack.id}
                            onClick={() => onPackChange(pack.id)}
                            className={`flex-shrink-0 p-3 rounded-lg transition text-center ${
                                selectedPack === pack.id
                                    ? "bg-purple-400 text-white"
                                    : "bg-purple-700 hover:bg-purple-500 text-white/70"
                            }`}
                            title={pack.name}
                        >
                            <span className="text-xl">{pack.thumbnail}</span>
                        </button>
                    ))}
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {currentPack?.stickers.map((sticker) => (
                        <button
                            key={sticker.id}
                            onClick={() => {
                                onSelectSticker(sticker);
                                onClose();
                            }}
                            className="p-3 hover:bg-purple-500 rounded-lg transition text-center bg-purple-700 aspect-square flex items-center justify-center"
                            title={sticker.name}
                        >
                            {/* For now, show placeholder since we don't have actual sticker images */}
                            <div className="w-12 h-12 bg-purple-400 rounded flex items-center justify-center">
                                <span className="text-xs text-white font-bold">
                                    {sticker.name.substring(0, 3)}
                                </span>
                            </div>
                            {/* Uncomment when you have actual sticker images:
                            <img 
                                src={sticker.url} 
                                alt={sticker.name}
                                className="w-12 h-12 object-contain"
                            />
                            */}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
