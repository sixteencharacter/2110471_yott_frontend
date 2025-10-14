"use client";
import { useState, useEffect } from "react";
import { mockStickerPacks, StickerPacks, Sticker } from "./stickerData";
import { StickerService } from "./stickerService";

interface UseStickerProps {
    token?: string;
    roomId?: number;
    onStickerSent?: (sticker: Sticker) => void;
}

export const useSticker = ({
    token,
    roomId,
    onStickerSent,
}: UseStickerProps = {}) => {
    const [stickerPacks, setStickerPacks] =
        useState<StickerPacks>(mockStickerPacks);
    const [selectedPack, setSelectedPack] = useState<string>("basic");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch sticker packs from backend when token is available
    useEffect(() => {
        if (token) {
            fetchStickerPacks();
        }
    }, [token]);

    const fetchStickerPacks = async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const fetchedPacks = await StickerService.fetchStickerPacks(token);
            setStickerPacks(fetchedPacks);
        } catch (err) {
            console.error("Using mock data due to fetch error:", err);
            // Keep using mock data if fetch fails
            setError("Failed to fetch stickers, using offline stickers");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSticker = async (sticker: Sticker) => {
        console.log("Selected sticker:", sticker);

        // If we have roomId and token, send the sticker as a message
        if (roomId && token) {
            try {
                await StickerService.sendStickerMessage(
                    roomId,
                    sticker,
                    selectedPack,
                    token
                );
                onStickerSent?.(sticker);
            } catch (error) {
                console.error("Failed to send sticker:", error);
                setError("Failed to send sticker");
            }
        } else {
            // Just notify parent component
            onStickerSent?.(sticker);
        }
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const downloadPack = async (packId: string) => {
        if (!token) return;

        try {
            setLoading(true);
            await StickerService.downloadStickerPack(packId, token);
            // Refresh sticker packs after download
            await fetchStickerPacks();
        } catch (error) {
            console.error("Failed to download sticker pack:", error);
            setError("Failed to download sticker pack");
        } finally {
            setLoading(false);
        }
    };

    return {
        stickerPacks,
        selectedPack,
        setSelectedPack,
        showModal,
        openModal,
        closeModal,
        handleSelectSticker,
        loading,
        error,
        downloadPack,
        refreshPacks: fetchStickerPacks,
    };
};
