"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    value: number
    min: number
    max: number
    step?: number
    onValueChange: (value: number) => void
}

export function Slider({
    label,
    value,
    min,
    max,
    step = 1,
    onValueChange,
    className,
    ...props
}: SliderProps) {
    // Calculate percentage for the custom progress bar effect
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div className={cn("space-y-4 py-2", className)}>
            {label && (
                <div className="flex justify-between items-end mb-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {label}
                    </label>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent leading-none">
                            {value}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">km</span>
                    </div>
                </div>
            )}
            <div className="relative flex items-center group">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onValueChange(Number(e.target.value))}
                    className={cn("w-full custom-slider", className)}
                    style={{ "--slider-percentage": `${percentage}%` } as React.CSSProperties}
                    {...props}
                />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-muted-foreground/50 px-0.5 pt-1 uppercase tracking-tighter">
                <span>Min: {min}km</span>
                <span>Max: {max}km</span>
            </div>
        </div>
    )
}
