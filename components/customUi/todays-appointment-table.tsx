// components/customUi/todays-appointment-table.tsx
'use client';

import React, { useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useGetAppointments } from "@/features/appointments/api/use-get-appointments"; // Your data fetching hook
import { format, parseISO, isToday, isValid } from 'date-fns'; // For date operations
import { Loader2 } from 'lucide-react'; // For loading state
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // For consistent styling

// Define the structure of an individual appointment object from useGetAppointments
export interface AppointmentData {
    id: string;
    bookingId?: number | string | null;
    date: string; // Expecting ISO string format from API, e.g., "2025-06-04T14:00:00.000Z"
    startTime: string;
    status: string | null;
    patientFirstName?: string; // Assuming your API/hook provides these
    patientLastName?: string;
    facility?: string;         // Facility Name
    interpreterFirstName?: string; // Assuming your API/hook provides these
    interpreterLastName?: string;
    isCertified?: boolean | null;
    appointmentType?: string | null;
}

const getStatusBadgeClasses = (status: string | null): string => {
    switch (status) {
        case 'Interpreter Requested':
            return 'bg-rose-100 text-rose-700 dark:bg-rose-700/30 dark:text-rose-300';
        case 'Confirmed':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-300';
        case 'Pending Authorization':
            return 'bg-violet-100 text-violet-700 dark:bg-violet-700/30 dark:text-violet-300';
        case 'Pending Confirmation':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300';
        case 'Closed':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300';
        case 'Late CX':
        case 'No Show':
            return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300'; // Default/Unknown status
    }
};


// This component no longer takes 'appointments' as a prop
const TodaysAppointmentTable: React.FC = () => {
    const { data: allAppointments, isLoading, error } = useGetAppointments();

    const todaysAppointments = useMemo(() => {
        if (!allAppointments) return [];

        return allAppointments.filter((appointment: AppointmentData) => {
            try {
                const appointmentDate = parseISO(appointment.date);
                return isToday(appointmentDate); // Check if the appointment date is today
            } catch (e) {
                console.error("Error parsing appointment date in TodaysAppointmentTable:", appointment.date, e);
                return false;
            }
        });
    }, [allAppointments]);

    const formatDisplayTime = (timeString?: string | null) => {
        if (!timeString) return 'N/A';
        try {
            const [hoursStr, minutesStr] = timeString.split(':');
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);

            if (!isNaN(hours) && !isNaN(minutes)) {
                const dummyDate = new Date(2000, 0, 1, hours, minutes);
                if (isValid(dummyDate)) {
                    return format(dummyDate, 'p'); // e.g., "2:30 PM"
                }
            }
            return timeString; // Fallback if parsing fails
        } catch {
            return timeString; // Fallback
        }
    };

    // Handle Loading State
    if (isLoading) {
        return (
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-gray-800">Today&apos;s Appointments</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-48"> {/* Adjust height as needed */}
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Loading appointments...</p>
                </CardContent>
            </Card>
        );
    }

    // Handle Error State
    if (error) {
        return (
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-gray-800">Today&apos;s Appointments</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-red-500 py-10">
                    Error loading appointments. Please try again later.
                </CardContent>
            </Card>
        );
    }

    // Handle No Appointments for Today
    if (!todaysAppointments || todaysAppointments.length === 0) {
        return (
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-gray-800">Today&apos;s Appointments</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center text-gray-500">
                    No appointments scheduled for today.
                </CardContent>
            </Card>
        );
    }

    // Render the table if data is available
    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">Today&apos;s Appointments</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableCaption>A list of appointments scheduled for today.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Patient Name</TableHead>
                            <TableHead>Facility</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>Interpreter</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Certified</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {todaysAppointments.map((appt) => {
                            const patientFullName = `${appt.patient || ''} ${appt.patientLastName || ''}`.trim() || 'N/A';
                            const interpreterFullName = `${appt.interpreterFirstName || ''} ${appt.interpreterLastName || ''}`.trim() || 'N/A';
                            const displayDate = appt.date ? format(parseISO(appt.date), 'MMM d, yyyy') : 'N/A';
                            const statusBadgeClasses = getStatusBadgeClasses(appt.status);

                            return (
                                <TableRow key={appt.id}>
                                    <TableCell>
                                        {appt.status ? (
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClasses}`}>
                                                {appt.status}
                                            </span>
                                        ) : (
                                            'N/A'
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{appt.bookingId || 'N/A'}</TableCell>
                                    <TableCell>{patientFullName}</TableCell>
                                    <TableCell>{appt.facility || 'N/A'}</TableCell>
                                    <TableCell>{displayDate}</TableCell>
                                    <TableCell>{formatDisplayTime(appt.startTime)}</TableCell>
                                    <TableCell>{interpreterFullName}</TableCell>
                                    <TableCell>{appt.appointmentType || 'N/A'}</TableCell>
                                    <TableCell>{appt.isCertified ? 'Yes' : (appt.isCertified === false ? 'No' : 'N/A')}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default TodaysAppointmentTable;