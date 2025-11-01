import { apiClient } from "@/lib/apiClient";
import { Sticker, StickerPack, StickerPacks } from "./stickerData";

export class StickerService {
    /**
     * Fetch sticker packs from the backend
     */
    static async fetchStickerPacks(token: string): Promise<StickerPack[]> {
        try {
            const response = await apiClient.get("/v1/user/manifest", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data["sticker"];
        } catch (error) {
            console.error("Failed to fetch sticker packs:", error);
                return {} as StickerPack[]; // Placeholder to avoid TS error
        //     throw error;
        }
    }

    /**
     * Download a specific sticker pack
     */
    static async downloadStickerPack(
        packId: string,
        token: string
    ): Promise<any> {
        // try {
        //     const response = await apiClient.post(
        //         `/v1/stickers/download/${packId}`,
        //         {},
        //         {
        //             headers: {
        //                 Authorization: `Bearer ${token}`,
        //             },
        //         }
        //     );
        //     return response.data;
        // } catch (error) {
        //     console.error("Failed to download sticker pack:", error);
        //     throw error;
        // }
        return {}; // Placeholder to avoid TS error
    }

    /**
     * Send sticker message
     */
    static async sendStickerMessage(
        roomId: number,
        sticker: Sticker,
        packId: Number,
        token: string
    ): Promise<any> {
        // try {
        //     const stickerMessage = {
        //         type: "sticker",
        //         stickerId: sticker.id,
        //         stickerUrl: sticker.url,
        //         packId: packId,
        //         animated: sticker.animated,
        //         roomId: roomId,
        //     };

        //     const response = await apiClient.post(
        //         "/v1/messages/sticker",
        //         stickerMessage,
        //         {
        //             headers: {
        //                 Authorization: `Bearer ${token}`,
        //             },
        //         }
        //     );
        //     return response.data;
        // } catch (error) {
        //     console.error("Failed to send sticker message:", error);
        //     throw error;
        // }
        return {}; // Placeholder to avoid TS error
    }
}
