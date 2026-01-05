"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Image as ImageIcon, Euro } from "lucide-react"
import imageCompression from "browser-image-compression"
import { useToast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MessageInputProps {
    onSendMessage: (content: string, type?: 'text' | 'image' | 'price_offer', metadata?: any) => void
    onTyping: () => void
    disabled?: boolean
}

export function MessageInput({ onSendMessage, onTyping, disabled }: MessageInputProps) {
    const { toast } = useToast()
    const [message, setMessage] = useState("")
    const [isPriceOpen, setIsPriceOpen] = useState(false)
    const [priceAmount, setPriceAmount] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const handleSend = () => {
        if (!message.trim() || disabled) return
        onSendMessage(message.trim())
        setMessage("")

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            }
            const compressedFile = await imageCompression(file, options)

            // In a real app, we would upload to S3/MinIO here and get a URL
            // For this POC, we'll use a data URL (base64)
            const reader = new FileReader()
            reader.readAsDataURL(compressedFile)
            reader.onloadend = () => {
                const base64data = reader.result as string
                onSendMessage("Shared an image", "image", { imageUrl: base64data })
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Image upload failed',
                description: 'Could not process image.'
            })
        }
    }

    const handleSendPrice = () => {
        if (!priceAmount || isNaN(Number(priceAmount))) return
        onSendMessage(`Offered for €${priceAmount}`, "price_offer", { amount: Number(priceAmount) })
        setIsPriceOpen(false)
        setPriceAmount("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }

        // Debounced typing indicator
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            onTyping()
        }, 500)
    }

    useEffect(() => {
        return () => {
            clearTimeout(typingTimeoutRef.current)
        }
    }, [])

    return (
        <div className="border-t border-border bg-background p-4">
            <div className="flex items-end gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                >
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </Button>

                <DropdownMenu open={isPriceOpen} onOpenChange={setIsPriceOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 flex-shrink-0"
                            disabled={disabled}
                        >
                            <Euro className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-4" align="start">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Offer Price</h4>
                                <p className="text-sm text-muted-foreground">
                                    Set a small amount to cover costs (optional).
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <div className="grid flex-1 items-center gap-2">
                                    <Label htmlFor="price" className="sr-only">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0.00"
                                        value={priceAmount}
                                        onChange={(e) => setPriceAmount(e.target.value)}
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                                <Button onClick={handleSendPrice}>Send</Button>
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={disabled}
                    className="min-h-[44px] max-h-[200px] resize-none py-3"
                    rows={1}
                />
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    size="icon"
                    className="h-11 w-11 flex-shrink-0"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
