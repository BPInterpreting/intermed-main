'use client'

import {Heading} from "@/components/customUi/heading";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import HeadingContainer from "@/components/customUi/headingContainer";
import {DataTable} from "@/components/ui/data-table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Plus} from "lucide-react";
import {columns} from "@/app/(dashboard)/patients/columns";
import {useRouter} from "next/navigation";
import {useGetPatients} from "@/features/patients/api/use-get-patients";


type Appointment = {
    id: string
    firstName: string
}

const data: Appointment[] = [
    {
        id: "728ed52f",
        firstName: "bryan ",
    },
    {
        id: "489e1d42",
        firstName: "celene",
    },
    // ...
]

const AppointmentsClient = (
) => {
    const router = useRouter();


    return (
        <>
            <div className='w-full pb-10'>
                <Card className=''>
                    <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                        <CardTitle className='text-3xl line-clamp-1'>Appointments</CardTitle>
                        <Button
                            onClick={() => router.push("/appointments/new")}
                        >
                            <Plus className='size-4 mr-2'/>
                            Add Appointment
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={data}/>
                    </CardContent>
                </Card>
            </div>

        </>
    )
}

export default AppointmentsClient;

