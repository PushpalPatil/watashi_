"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import React from "react"

interface DatePickedProps {
    value?: Date;
    onChange?: (d: Date) => void;
}

export function CalendarComponent({ value, onChange }: DatePickedProps) {
   
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full rounded-md border border-border bg-transparent px-3 py-2 text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    {value ? format(value, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full rounded-md border border-border px-3 py-2">
                <Calendar
                    mode="single"
                    selected={value}
                    captionLayout="dropdown"
                    onSelect={(d) => {
                        
                        if (d) onChange?.(d);
                        setOpen(false);
                    }}
                    disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                />
            </PopoverContent>
        </Popover>

    )
}
