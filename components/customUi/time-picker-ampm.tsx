"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SimpleTimePicker() {
    return (
        <div className="grid gap-2">
            <Input
                id="time-picker"
                type="time"
                className="bg-background"
            />
        </div>
    )
}