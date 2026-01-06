"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, X } from "lucide-react"

interface LocationPermissionBannerProps {
    onEnable: () => void
    onDismiss: () => void
    isVisible: boolean
}

export function LocationPermissionBanner({ onEnable, onDismiss, isVisible }: LocationPermissionBannerProps) {
    if (!isVisible) return null

    return (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 relative animate-in slide-in-from-top-2">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Find food near you</p>
                        <p className="text-xs text-muted-foreground">Enable location to see food in your area.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={onEnable}
                        className="h-8 text-xs bg-primary hover:bg-primary/90"
                    >
                        Enable Location
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDismiss}
                        className="h-8 w-8 text-muted-foreground hover:bg-primary/5 rounded-full"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
