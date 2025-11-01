"use client";
import React from "react";
import { X } from "lucide-react";
import { StickerPacks, Sticker, StickerPack } from "./stickerData";

interface StickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSticker: (sticker: string) => void;
    stickerPacks: StickerPack[];
    selectedPack: number;
    onPackChange: (packId: number) => void;
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

    const currentPack = selectedPack;
    const stickerHost = process.env.NEXT_PUBLIC_STICKER_BASE;

    // Close modal when clicking outside
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            {/* Invisible overlay to close modal when clicking outside */}
            <div className="fixed inset-0 z-40" onClick={handleOverlayClick} />

            {/* Sticker modal positioned above chat input */}
            <div className="fixed bottom-25 right-90 z-50 w-[480px] max-w-xl">
                <div className="bg-purple-600 border-2 border-purple-500 rounded-lg p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-bold text-white">
                            Stickers - {stickerPacks[currentPack].package}
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
                        {Object.values(stickerPacks).map((pack,idx) => (
                            <button
                                key={pack.package}
                                onClick={() => onPackChange(idx)}
                                className={`flex-shrink-0 p-3 rounded-lg transition text-center ${
                                    selectedPack === idx
                                        ? "bg-purple-400 text-white"
                                        : "bg-purple-700 hover:bg-purple-500 text-white/70"
                                }`}
                                title={pack.package}
                            >
                                <span className="text-xl">
                                    {"S" + String(idx)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Stickers Grid */}
                    <div className="grid grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                        {stickerPacks[currentPack].pictures.map((sticker) => (
                            <button
                                key={sticker}
                                onClick={() => {
                                    onSelectSticker(sticker);
                                    onClose();
                                }}
                                className="p-4 hover:bg-purple-500 rounded-lg transition text-center bg-purple-700 aspect-square flex items-center justify-center"
                                title={sticker}
                            >
                            <img 
                                src={stickerHost + sticker} 
                                alt={sticker}
                                className="w-12 h-12 object-contain"
                            />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};
