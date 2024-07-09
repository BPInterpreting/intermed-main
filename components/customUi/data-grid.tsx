'use client'
import {CalendarCheck, CalendarClock, CalendarMinus} from "lucide-react";

import {useSearchParams} from "next/navigation";
import {DataCard} from "@/components/customUi/data-card";
import {useEffect, useState} from "react";
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";

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
    const {data} = useGetAppointments()
    const params = useSearchParams()
    const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([])

    useEffect(() => {
        if (data) {
            const today = new Date().toISOString().split('T')[0]
            const filteredAppointments = data.filter((appointment: Appointment) => {
               return appointment.date.startsWith(today)
            })
            setTodaysAppointments(filteredAppointments)
        }
    }, [data])



    return(
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8'>
            <DataCard
                title={'Appointments Today'}
                icon={CalendarClock}
                value={todaysAppointments.length}
            />
            <DataCard icon={CalendarMinus} title={'Appointments not Closed'} />
            <DataCard
                title={'Appointments Today'}
                icon={CalendarClock}
            />


        {/*    TODO: Pie chart that shows distribution of facilities in percentage */}

        </div>
    )
}