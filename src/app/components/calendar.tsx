"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


const FormSchema = z.object({
    dob: z.date({
        required_error: "A date of birth is required.",
    }),
})

export function CalendarComponent(props: { date: Date | undefined, onChange: (date: Date | undefined) => void}) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    function onSubmit(values: z.infer<typeof FormSchema>) {
        toast.success("Date of birth set.", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(values, null, 2)}</code>
                </pre>
            ),
        })
    }

    const date = props.date
    console.log(date)


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }: { field: any }) => (
                        <FormItem className="flex flex-col">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full rounded-md border border-border bg-transparent px-3 py-2 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="w-full h-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full rounded-md border border-border px-3 py-2">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={ (selected) => {
                                            props.onChange(selected)
                                            form.setValue("dob", selected as Date)
                                        }}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        captionLayout="dropdown"
                                        
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Your date of birth is required to generate your chart.
                            </FormDescription>
                        </FormItem>
                    )}

                />
            </form>
        </Form>
        
        
    )
}
