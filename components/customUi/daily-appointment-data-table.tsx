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

// This interface should match the data from useGetAppointments
export interface AppointmentData {
    id: string;
    bookingId?: number | string | null;
    date: string; // ISO String format
    startTime: string;
    status: string | null;
    patientFirstName?: string;
    patientLastName?: string;
    facility?: string;
    interpreterFirstName?: string;
    interpreterLastName?: string;
    isCertified?: boolean | null;
    appointmentType?: string | null;
}

// Helper function for status badge styling
const getStatusBadgeClasses = (status: string | null): string => {
    switch (status) {
        case 'Interpreter Requested': return 'bg-rose-100 text-rose-700 dark:bg-rose-700/30 dark:text-rose-300';
        case 'Confirmed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-300';
        case 'Pending Authorization': return 'bg-violet-100 text-violet-700 dark:bg-violet-700/30 dark:text-violet-300';
        case 'Pending Confirmation': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300';
        case 'Closed': return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300';
        case 'Late CX':
        case 'No Show': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300';
    }
};

export const DailyAppointmentsWidget: React.FC = () => {
    // State to manage the selected date
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const { data: allAppointments, isLoading, error } = useGetAppointments();

    // Memoized list of appointments for the selected day
    const appointmentsForSelectedDay = useMemo(() => {
        if (!allAppointments) return [];
        return allAppointments.filter((appointment: AppointmentData) => {
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
                    <CardTitle className="text-2xl font-semibold text-gray-800">Daily Appointments</CardTitle>
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
                    <CardTitle className="text-2xl font-semibold text-gray-800">Daily Appointments</CardTitle>
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Facility</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>Interpreter</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Certified</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointmentsForSelectedDay.length > 0 ? (
                            // Map through appointments for the selected day
                            appointmentsForSelectedDay.map((appt) => {
                                const patientFullName = `${appt.patient || ''} ${appt.patientLastName || ''}`.trim() || 'N/A';
                                const interpreterFullName = `${appt.interpreterFirstName || ''} ${appt.interpreterLastName || ''}`.trim() || 'N/A';
                                const statusBadgeClasses = getStatusBadgeClasses(appt.status);

                                return (
                                    <TableRow key={appt.id}>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClasses}`}>
                                                {appt.status || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium">{appt.bookingId || 'N/A'}</TableCell>
                                        <TableCell>{patientFullName}</TableCell>
                                        <TableCell>{appt.facility || 'N/A'}</TableCell>
                                        <TableCell>{formatDisplayTime(appt.startTime)}</TableCell>
                                        <TableCell>{interpreterFullName}</TableCell>
                                        <TableCell>{appt.appointmentType || 'N/A'}</TableCell>
                                        <TableCell>{appt.isCertified ? 'Yes' : (appt.isCertified === false ? 'No' : 'N/A')}</TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No appointments found for this date.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default DailyAppointmentsWidget;
