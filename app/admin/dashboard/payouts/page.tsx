'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Download, CheckCircle } from "lucide-react";
import { columns } from "@/app/admin/dashboard/payouts/columns";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPayouts } from "@/features/payouts/api/use-get-payouts";
import { useGeneratePayoutsDialog } from "@/features/payouts/hooks/use-generate-payouts-dialog";
import { SupportedFilters } from "@/components/ui/data-table-toolbar";
import { useMemo } from "react";

const PayoutsPage = () => {
    const generateDialog = useGeneratePayoutsDialog()
    const payoutsQuery = useGetPayouts()
    const payouts = payoutsQuery.data || []

    const payoutTableFilters: SupportedFilters[] = ['globalSearch']

    // Calculate pending totals
    const pendingStats = useMemo(() => {
        const pending = payouts.filter(p => p.status === 'pending' || p.status === 'processing')
        const total = pending.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0)
        return { count: pending.length, total }
    }, [payouts])

    if (payoutsQuery.isLoading) {
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
                        <CardTitle className='text-3xl line-clamp-1'>Payouts</CardTitle>
                        <Button onClick={generateDialog.onOpen}>
                            <Plus className='size-4 mr-2' />
                            Generate Payouts
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Pending Summary Bar */}
                        {pendingStats.count > 0 && (
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending Payouts</p>
                                        <p className="text-2xl font-bold">{pendingStats.count}</p>
                                    </div>
                                    <div className="h-10 w-px bg-border" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Amount</p>
                                        <p className="text-2xl font-bold">${pendingStats.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="size-4 mr-2" />
                                        Export Pending
                                    </Button>
                                </div>
                            </div>
                        )}

                        <DataTable 
                            columns={columns} 
                            data={payouts} 
                            enabledFilters={payoutTableFilters} 
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default PayoutsPage;