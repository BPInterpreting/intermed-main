// components/customUi/DailyAppointmentsWidget.tsx (new name for the component)
'use client';

import React, { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useGetAppointments } from "@/features/appointments/api/use-get-appointments";
import { format, parseISO, isSameDay, isValid, addDays, subDays } from 'date-fns';
import { Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {DataTable} from "@/components/ui/data-table";
import {columns, ResponseType} from "@/app/admin/dashboard/home/columns";
import {SupportedFilters} from "@/components/ui/data-table-toolbar";

export const DailyAppointmentsWidget: React.FC = () => {
    // State to manage the selected date
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const { data: allAppointments, isLoading, error } = useGetAppointments();

    const appointmentTableFilters: SupportedFilters[] = ['globalSearch', "status", "interpreter"]

    // Memoized list of appointments for the selected day
    const appointmentsForSelectedDay = useMemo(() => {
        if (!allAppointments) return [];
        return allAppointments.filter((appointment: ResponseType) => {
            try {
                // isSameDay correctly compares the calendar date, ignoring time
                return isSameDay(parseISO(appointment.date), selectedDate);
            } catch (e) {
                console.error("Error parsing appointment date:", appointment.date, e);
                return false;
            }
        });
    }, [allAppointments, selectedDate]);

    // Handlers for date navigation
    const handlePreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
    const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));

    //dummy date is used to format the date and exculde the time part
    const formatDisplayTime = (timeString?: string | null) => {
        if (!timeString) return 'N/A';
        try {
            const dummyDate = new Date(`1970-01-01T${timeString}`);
            if (isValid(dummyDate)) return format(dummyDate, 'p');
            return timeString;
        } catch { return timeString; }
    };

    //TODO: Handle loading and error states with skeletons
    if (isLoading) {
        return (
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle >Daily Appointments</CardTitle>
                    <CardDescription>Loading appointment data...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        // Handle error state gracefully
        return <Card className="p-4 text-center text-red-500">Error loading appointments.</Card>;
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-2xl font-semibold text-primary">Daily Appointments</CardTitle>
                    <CardDescription>
                        Displaying appointments for {format(selectedDate, "PPP")}.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 pt-4 sm:pt-0">
                    <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(day) => day && setSelectedDate(day)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={handleNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div>
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ): (
                    <DataTable columns={columns} data={appointmentsForSelectedDay} enabledFilters={appointmentTableFilters} />
                )}
            </CardContent>
        </Card>
    );
};

export default DailyAppointmentsWidget;
