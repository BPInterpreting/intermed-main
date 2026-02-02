'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPayers } from "@/features/payers/api/use-get-payers";
import { useNewPayer } from "@/features/payers/hooks/use-new-payer";
import { SupportedFilters } from "@/components/ui/data-table-toolbar";

const PayersPage = () => {
    const newPayer = useNewPayer()
    const payersQuery = useGetPayers()
    const payers = payersQuery.data || []

    const payerTableFilters: SupportedFilters[] = ['globalSearch']

    if (payersQuery.isLoading) {
        return (
            <div>
                <Card className='w-full pb-10'>
                    <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                        <Skeleton className='h-8 w-48' />
                    </CardHeader>
                    <CardContent>
                        <div className='h-[500px] w-full flex items-center justify-center'>
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
                        <CardTitle className='text-3xl line-clamp-1'>Payers</CardTitle>
                        <Button onClick={newPayer.onOpen}>
                            <Plus className='size-4 mr-2' />
                            Add Payer
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns} 
                            data={payers} 
                            enabledFilters={payerTableFilters} 
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default PayersPage;