import axios from "axios"

console.log(process.env.BACKEND_URL)

export const apiClient = axios.create({
    baseURL: process.env.BACKEND_URL ?? "http://localhost:8000/",
})
