// Sticker Types
export interface Sticker {
    id: number;
    url: string;
    name: string;
    animated: boolean;
}

export interface StickerPack {
    package: string;
    size: Number[];
    pictures : string[];
}

export interface StickerPacks {
    [key: string]: StickerPack;
}