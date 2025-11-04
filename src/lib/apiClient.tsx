import axios from "axios"

console.log(process.env.NEXT_PUBLIC_BACKEND_URL)

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/",
})
