'use client'

import { CalendarClock, TriangleIcon, User } from "lucide-react";
import { DataCard } from "@/components/customUi/data-card";
import { useMemo } from "react";
import { useGetAppointments } from "@/features/appointments/api/use-get-appointments";
import { isBefore, isToday, parseISO, startOfDay } from "date-fns";

// Define the shape of your appointment data, ensuring it has interpreterId
interface Appointment {
    id: string;
    date: string;
    status: string | null;
    interpreterId?: string | null; // This field is needed to count unique interpreters
    // Add other fields that might be returned by your API
    notes?: string | null;
    startTime?: string;
    endTime?: string | null;
    appointmentType?: string | null;
    facility?: string;
    facilityId?: string | null;
    patient?: string;
    patientId?: string | null;
}

export const DataGrid = () => {
    // Fetch appointments once
    const { data: allAppointments, isLoading } = useGetAppointments();

    // Calculate all derived values using useMemo for efficiency.
    // This avoids re-calculating on every render, only when `allAppointments` changes.
    const {
        todaysAppointmentsCount,
        appointmentsNotClosedCount,
        todaysBookedInterpretersCount,
    } = useMemo(() => {
        if (!allAppointments) {
            return {
                todaysAppointmentsCount: 0,
                appointmentsNotClosedCount: 0,
                todaysBookedInterpretersCount: 0,
            };
        }

        const today = new Date();
        const startOfToday = startOfDay(today);

        // Filter for today's appointments
        const todaysAppointments = allAppointments.filter((appointment: Appointment) => {
            try {
                return isToday(parseISO(appointment.date));
            } catch {
                return false; // Handle invalid date strings gracefully
            }
        });

        // Calculate appointments not closed from past dates
        const notClosedCount = allAppointments.filter(appointment => {
            if (!appointment.status || !appointment.date) return false;
            try {
                const appointmentDate = parseISO(appointment.date);
                // An appointment from before today that is still 'Confirmed'
                return isBefore(appointmentDate, startOfToday) && appointment.status === 'Confirmed';
            } catch {
                return false;
            }
        }).length;

        // Calculate unique interpreters for today's appointments
        const uniqueInterpreterIds = new Set(
            todaysAppointments
                .map(appt => appt.interpreterId)
                .filter(id => id != null) // Filter out any null or undefined IDs
        );

        return {
            todaysAppointmentsCount: todaysAppointments.length,
            appointmentsNotClosedCount: notClosedCount,
            todaysBookedInterpretersCount: uniqueInterpreterIds.size,
        };
    }, [allAppointments]);

    if (isLoading) {
        // You can return a skeleton loader here for a better UX
        return <div>Loading data cards...</div>;
    }

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-2 mb-8'>
            <DataCard
                title={'Appointments Today'}
                icon={CalendarClock}
                value={todaysAppointmentsCount}
            />
            <DataCard
                icon={TriangleIcon}
                title={'Past Due Appointments'}
                value={appointmentsNotClosedCount}
            />
            <DataCard
                title={'Interpreters Booked Today'}
                icon={User}
                value={todaysBookedInterpretersCount}
            />
        </div>
    );
}
