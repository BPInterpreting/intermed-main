'use client'

import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/ui/data-table";
import {columns} from "./columns";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Loader2, Plus} from "lucide-react";
import {useNewPatient} from "@/features/patients/hooks/use-new-patient";
import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {Skeleton} from "@/components/ui/skeleton";
import {SupportedFilters} from "@/components/ui/data-table-toolbar";

const PatientsClient = (
) => {
    const newPatient = useNewPatient()
    const patientsQuery = useGetPatients()
    const patients = patientsQuery.data || []

    const patientTableFilters: SupportedFilters[] = ['fullName']

    if(patientsQuery.isLoading){
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
                        <CardTitle className='text-3xl line-clamp-1'>Patients</CardTitle>
                        <Button
                            onClick = {newPatient.onOpen}
                        >
                            <Plus className='size-4 mr-2'/>
                            Add Patient
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={patients} enabledFilters={patientTableFilters}/>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default PatientsClient;