"use client";
import { useState, useEffect } from "react";
import { StickerPacks, Sticker, StickerPack } from "../sticker/stickerData";
import { StickerService } from "../sticker/stickerService";
import { Socket } from "socket.io-client";

interface UseStickerProps {
    token?: string;
    roomId?: number;
    socket? : Socket|null
}

export const useSticker = ({
    token,
    roomId,
    socket
}: UseStickerProps = {}) => {
    const [stickerPacks, setStickerPacks] =
        useState<StickerPack[]>();
    const [selectedPack, setSelectedPack] = useState<number>(0);
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
            console.log(fetchedPacks)
            setStickerPacks(fetchedPacks);
        } catch (err) {
            console.error("Using mock data due to fetch error:", err);
            // Keep using mock data if fetch fails
            setError("Failed to fetch stickers, using offline stickers");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSticker = async (sticker: string) => {
        console.log("Selected sticker:", sticker);
        const messageData = {
            cid: roomId,
            message: sticker,
            type : "sticker"
        }
        socket?.emit("send_message", messageData)
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
