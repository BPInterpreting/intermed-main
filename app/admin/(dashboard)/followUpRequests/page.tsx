'use client'

import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/ui/data-table";
import {columns} from "./columns";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Loader2, Plus} from "lucide-react";
import {useNewPatient} from "@/features/patients/hooks/use-new-patient";
import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {Skeleton} from "@/components/ui/skeleton";
import {useNewFollowUpRequest} from "@/features/followUpRequests/hooks/use-new-follow-up-request";
import {useGetFollowUpRequests} from "@/features/followUpRequests/api/use-get-follow-up-requests";

const FollowUpRequestClient = (
) => {
    const newFollowUpRequest = useNewFollowUpRequest()
    const followUpRequestQuery = useGetFollowUpRequests()
    const followUpRequest = followUpRequestQuery.data || []

    if(followUpRequestQuery.isLoading){
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
                        <CardTitle className='text-3xl line-clamp-1'>Follow Up Requests</CardTitle>
                        <Button
                            onClick = {newFollowUpRequest.onOpen}
                        >
                            <Plus className='size-4 mr-2'/>
                            Add Follow Up Request
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={followUpRequest}/>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default FollowUpRequestClient;