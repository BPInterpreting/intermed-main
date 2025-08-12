"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateOfBirthProps {
    value?: string | null
    onChange: (date: string | null) => void
    placeholder?: string
    disabled?: boolean
}

export function DateOfBirthPicker({ value, onChange, placeholder = "Select date of birth", disabled }: DateOfBirthProps) {
    const [open, setOpen] = React.useState(false)

    // Manual parsing to avoid timezone issues
    const dateValue = React.useMemo(() => {
        if (!value || typeof value !== 'string') return undefined

        const parts = value.split('-')
        if (parts.length !== 3) return undefined

        const year = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1 // month is 0-indexed
        const day = parseInt(parts[2])

        if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined

        return new Date(year, month, day)
    }, [value])

    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
                Date of birth
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-48 justify-between font-normal"
                        disabled={disabled}
                    >
                        {dateValue ? dateValue.toLocaleDateString() : placeholder}
                        <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={dateValue}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            if (date) {
                                const year = date.getFullYear()
                                const month = String(date.getMonth() + 1).padStart(2, '0')
                                const day = String(date.getDate()).padStart(2, '0')
                                onChange(`${year}-${month}-${day}`)
                            } else {
                                onChange(null)
                            }
                            setOpen(false)
                        }}
                        disabled={disabled}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}