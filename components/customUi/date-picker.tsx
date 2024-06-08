import * as React from 'react';
import {format} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type Props = {
    value?: Date
    onChange?: SelectSingleEventHandler
    disabled?: boolean
}

export const DatePicker = ({
value,
onChange,
disabled
}: Props) => {
    const [open, setOpen] = React.useState(false)

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant='ghost'
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground'
                        )}
                    disabled={disabled}
                >
                    <CalendarIcon className='size-4 mr-2' />
                    {value ? format(value, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Calendar
                    mode='single'
                    selected={value}
                    onSelect={onChange}
                    disabled={disabled}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}