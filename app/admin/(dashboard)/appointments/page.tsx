'use client'

import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/ui/data-table";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {Loader2, Plus} from "lucide-react";
import {columns} from "@/app/admin/(dashboard)/appointments/columns";
import {Skeleton} from "@/components/ui/skeleton";
import {useNewAppointment} from "@/features/appointments/hooks/use-new-appointments";
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";
import {SupportedFilters} from "@/components/ui/data-table-toolbar";


const AppointmentsClient = (
) => {
    const newAppointment = useNewAppointment()
    const appointmentsQuery = useGetAppointments()
    const appointments  = appointmentsQuery.data || []

    const appointmentTableFilters: SupportedFilters[] = ['patient', "status"]

    if(appointmentsQuery.isLoading){
        return (
            <div>
                <Card className='w-full pb-10'>
                    <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                        <Skeleton className='h-8 w-48' />
                    </CardHeader>
                    <CardContent>
                        <div className='h-[500px] w-full flex items-center'>
                            <Loader2 className='size-6 text-slate-300 animate-spin' />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className='flex-1 px-4 w-full pb-10'>
                <Card className='border-none shadow-none'>
                    <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                        <CardTitle className='text-3xl line-clamp-1'>Appointment History</CardTitle>
                        <Button
                            onClick={newAppointment.onOpen}
                        >
                            <Plus className='size-4 mr-2'/>
                            Add Appointment
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={appointments} enabledFilters={appointmentTableFilters}  />
                    </CardContent>
                </Card>
            </div>
        </>

    )
}

export default AppointmentsClient;

