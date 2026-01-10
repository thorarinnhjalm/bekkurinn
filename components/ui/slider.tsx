import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
    value: number[]
    min: number
    max: number
    step: number
    onValueChange: (value: number[]) => void
    className?: string
}

export function Slider({ value, min, max, step, onValueChange, className }: SliderProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange([parseFloat(e.target.value)])
    }

    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={handleChange}
            className={cn(
                "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-nordic-blue",
                className
            )}
        />
    )
}
