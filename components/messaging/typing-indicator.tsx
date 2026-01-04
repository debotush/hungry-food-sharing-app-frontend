"use client"

export function TypingIndicator() {
    return (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 mr-auto max-w-[80%]">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
    )
}
