// types/node-env.d.ts
declare namespace NodeJS {
    export interface ProcessEnv {
        KC_CLIENT_SECRET: string
        KC_CLIENT_ID: string
        KC_CLIENT_ISSUER: string
        KC_TOKEN_ENDPOINT: string
        BACKEND_URL: string
        NEXT_PUBLIC_STICKER_BASE: string
    }
}
