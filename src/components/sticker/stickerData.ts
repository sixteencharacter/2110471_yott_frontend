// Sticker Types
export interface Sticker {
    id: number;
    url: string;
    name: string;
    animated: boolean;
}

export interface StickerPack {
    id: string;
    name: string;
    thumbnail: string;
    stickers: Sticker[];
}

export interface StickerPacks {
    [key: string]: StickerPack;
}

// Mock LINE-style sticker packs
export const mockStickerPacks: StickerPacks = {
    basic: {
        id: "basic",
        name: "Basic Emotions",
        thumbnail: "😀",
        stickers: [
            {
                id: 1,
                url: "/stickers/basic/happy.png",
                name: "Happy",
                animated: false,
            },
            {
                id: 2,
                url: "/stickers/basic/laugh.gif",
                name: "Laugh",
                animated: true,
            },
            {
                id: 3,
                url: "/stickers/basic/love.png",
                name: "Love",
                animated: false,
            },
            {
                id: 4,
                url: "/stickers/basic/think.gif",
                name: "Think",
                animated: true,
            },
            {
                id: 5,
                url: "/stickers/basic/thumbs.png",
                name: "Thumbs Up",
                animated: false,
            },
            {
                id: 6,
                url: "/stickers/basic/heart.gif",
                name: "Heart",
                animated: true,
            },
        ],
    },
    animals: {
        id: "animals",
        name: "Cute Animals",
        thumbnail: "🐱",
        stickers: [
            {
                id: 7,
                url: "/stickers/animals/cat.png",
                name: "Cat",
                animated: false,
            },
            {
                id: 8,
                url: "/stickers/animals/dog.gif",
                name: "Dog",
                animated: true,
            },
            {
                id: 9,
                url: "/stickers/animals/bear.png",
                name: "Bear",
                animated: false,
            },
            {
                id: 10,
                url: "/stickers/animals/rabbit.gif",
                name: "Rabbit",
                animated: true,
            },
            {
                id: 11,
                url: "/stickers/animals/panda.png",
                name: "Panda",
                animated: false,
            },
            {
                id: 12,
                url: "/stickers/animals/fox.gif",
                name: "Fox",
                animated: true,
            },
        ],
    },
    reactions: {
        id: "reactions",
        name: "Reactions",
        thumbnail: "🎭",
        stickers: [
            {
                id: 13,
                url: "/stickers/reactions/wow.png",
                name: "Wow",
                animated: false,
            },
            {
                id: 14,
                url: "/stickers/reactions/clap.gif",
                name: "Clap",
                animated: true,
            },
            {
                id: 15,
                url: "/stickers/reactions/cry.png",
                name: "Cry",
                animated: false,
            },
            {
                id: 16,
                url: "/stickers/reactions/party.gif",
                name: "Party",
                animated: true,
            },
            {
                id: 17,
                url: "/stickers/reactions/sleep.png",
                name: "Sleep",
                animated: false,
            },
            {
                id: 18,
                url: "/stickers/reactions/dance.gif",
                name: "Dance",
                animated: true,
            },
        ],
    },
};
