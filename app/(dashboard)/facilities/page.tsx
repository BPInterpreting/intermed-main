'use client'

import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/ui/data-table";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {Plus} from "lucide-react";
import {columns} from "@/app/(dashboard)/facilities/columns";
import {useGetFacilities} from "@/features/facilities/api/use-get-facilities";
import {useNewFacility} from "@/features/facilities/hooks/use-new-facility";


const FacilitiesClient = (
) => {
    const newFacility = useNewFacility()
    const facilitiesQuery = useGetFacilities()
    const facilities  = facilitiesQuery.data || []

    return (
        <div className='w-full pb-10'>
            <Card className=''>
                <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                    <CardTitle className='text-3xl line-clamp-1' >Medical Facilities</CardTitle>
                    <Button
                        onClick = {newFacility.onOpen}
                    >
                        <Plus className='size-4 mr-2' />
                        Add Facility
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={facilities} />
                </CardContent>
            </Card>
        </div>
    )
}

export default FacilitiesClient;

