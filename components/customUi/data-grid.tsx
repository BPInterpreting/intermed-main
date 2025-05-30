'use client'
import {CalendarClock, TriangleIcon,} from "lucide-react";

import {useSearchParams} from "next/navigation";
import {DataCard} from "@/components/customUi/data-card";
import {useEffect, useMemo, useState} from "react";
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";
import {isBefore, parseISO, startOfDay} from "date-fns";

interface Appointment {
    id: string;
    date: string;
    notes: string | null;
    startTime: string;
    endTime: string | null;
    appointmentType: string | null;
    facility: string;
    facilityId: string | null;
    patient: string;
    patientId: string | null;
}

export const DataGrid = () => {
    const {data, isLoading} = useGetAppointments()
    const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([])


    const {data: appointments} = useGetAppointments()

    const appointmentsNotClosed = useMemo(() => {
        if (!appointments) return 0

        const today = startOfDay(new Date())
        
        return appointments.filter(appointment => {
            if (!appointment.status) return false
            
            try {
                const appointmentDate = parseISO(appointment.date)
                
                return isBefore(appointmentDate, today) && appointment.status === 'Confirmed'
            } catch (e) {
                console.error("Error processing date for past due check:", appointment.date, e);
                return false;
            }
        }).length
    }, [appointments])

    useEffect(() => {
        if (data) {
            const today = new Date().toISOString().split('T')[0]
            const filteredAppointments = data.filter((appointment: Appointment) => {
               return appointment.date.startsWith(today)
            })
            setTodaysAppointments(filteredAppointments)
        }
    }, [data])

    if (isLoading) {
        return <div>Loading...</div>
    }

    return(
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8'>
            <DataCard
                title={'Appointments Today'}
                icon={CalendarClock}
                value={todaysAppointments.length}
            />
            <DataCard
                icon={TriangleIcon}
                title={'Appointments not Closed'}
                value={appointmentsNotClosed}

            />
        </div>
    )
}