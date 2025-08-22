"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import React from "react"

interface DatePickedProps {
    readonly value?: Date;
    readonly onChange?: (d: Date) => void;
}

function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

export function CalendarComponent({ value, onChange }: DatePickedProps) {
    const [open, setOpen] = React.useState(false)
    const [month, setMonth] = React.useState<Date | undefined>(value)
    const [inputValue, setInputValue] = React.useState(formatDate(value))

    // Update input value when prop value changes
    React.useEffect(() => {
        setInputValue(formatDate(value))
        setMonth(value)
    }, [value])

    return (
        <div className="w-full">
            <div className="relative">
                <Input
                    id="date"
                    value={inputValue}
                    placeholder="Pick a date"
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 pr-10"
                    onChange={(e) => {
                        // Allow free text input without immediate validation
                        setInputValue(e.target.value)
                    }}
                    onBlur={(e) => {
                        // Validate and update date when input loses focus
                        const target = e.target as HTMLInputElement
                        const date = new Date(target.value)
                        if (isValidDate(date)) {
                            onChange?.(date)
                            setMonth(date)
                        } else {
                            // Reset to last valid date if input is invalid
                            setInputValue(formatDate(value))
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setOpen(true)
                        }
                        if (e.key === "Enter") {
                            // Validate and update date on Enter key
                            const target = e.target as HTMLInputElement
                            const date = new Date(target.value)
                            if (isValidDate(date)) {
                                onChange?.(date)
                                setMonth(date)
                            } else {
                                setInputValue(formatDate(value))
                            }
                            target.blur()
                        }
                    }}
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="date-picker"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode="single"
                            selected={value}
                            captionLayout="dropdown"
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(date) => {
                                if (date) {
                                    onChange?.(date)
                                    setInputValue(formatDate(date))
                                    setOpen(false)
                                }
                            }}
                            disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
