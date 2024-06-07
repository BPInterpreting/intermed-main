'use client'

import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/ui/data-table";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {Loader2, Plus} from "lucide-react";
import {columns} from "@/app/(dashboard)/facilities/columns";
import {useGetFacilities} from "@/features/facilities/api/use-get-facilities";
import {useNewFacility} from "@/features/facilities/hooks/use-new-facility";
import {Skeleton} from "@/components/ui/skeleton";
import {useNewAppointment} from "@/features/appointments/hooks/use-new-appointments";
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";
import appointments from "@/app/api/[[...route]]/appointments";


const AppointmentsClient = (
) => {
    const newAppointment = useNewAppointment()
    const appointmentsQuery = useGetAppointments()
    const appointments  = appointmentsQuery.data || []

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
                            Add Facility
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={appointments}/>
                    </CardContent>
                </Card>
            </div>
        </>

    )
}

export default AppointmentsClient;

