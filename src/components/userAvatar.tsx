// User Avatar Component
export const UserAvatar = ({
    name,
    isOnline = false,
    size = "md",
}: {
    name: string
    isOnline: boolean
    size: string
}) => {
    const sizeClasses: Record<string, string> = {
        xs: "w-6 h-6 text-xs",
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-lg",
        xl: "w-14 h-14 text-lg",
    }

    const bgColors = [
        "bg-purple-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-pink-400",
        "bg-orange-400",
        "bg-red-400",
        "bg-indigo-400",
        "bg-cyan-400",
    ]

    const colorIndex = name.charCodeAt(0) % bgColors.length
    const initials = name.charAt(0).toUpperCase()

    return (
        <div className="relative">
            <div
                className={`${sizeClasses[size]} ${bgColors[colorIndex]} rounded-full flex items-center justify-center font-bold text-white`}
            >
                {initials}
            </div>
            {isOnline ? (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            ) : (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full" />
            )}
        </div>
    )
}
