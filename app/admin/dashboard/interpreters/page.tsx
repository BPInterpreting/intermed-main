'use client'

import {DataTable} from "@/components/ui/data-table";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {Loader2} from "lucide-react";
import {columns} from "@/app/admin/dashboard/interpreters/columns";
import {useGetInterpreters} from "@/features/interpreters/api/use-get-interpreters";
import {useNewInterpreter} from "@/features/interpreters/hooks/use-new-interpreter";
import {Skeleton} from "@/components/ui/skeleton";
import {SupportedFilters} from "@/components/ui/data-table-toolbar";


const InterpretersClient = (
) => {
    const newInterpreter = useNewInterpreter()
    const interpretersQuery = useGetInterpreters()
    const interpreters  = interpretersQuery.data || []

    const interpreterTableFilters: SupportedFilters[] = ['globalSearch']

    if(interpretersQuery.isLoading){
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
                        <CardTitle className='text-3xl line-clamp-1'>Interpreters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={interpreters} enabledFilters={interpreterTableFilters}/>
                    </CardContent>
                </Card>
            </div>
        </>

    )
}

export default InterpretersClient;

