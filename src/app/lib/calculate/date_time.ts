import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { CalendarComponent } from "@/app/components/calendar";

export function formatDateTime(date: Date, format: string): string{
    
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();


}
