"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function CalendarComponent(props: { date: Date | undefined, onChange: (date: Date | undefined) => void}) {
    const date = props.date
    console.log(date)
    return (

        <Popover>
            <PopoverTrigger asChild>
                
                <Button
                    variant="outline"
                    data-empty={!date}
                    className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal w-full rounded-md border border-border"
                >
                    <CalendarIcon />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>

            </PopoverTrigger>
            
            <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(selected) => props.onChange(selected)} />
            </PopoverContent>

        </Popover>
        
    )
}
