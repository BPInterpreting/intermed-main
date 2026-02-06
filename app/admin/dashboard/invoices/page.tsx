'use client'

import { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { useGetInvoices } from "@/features/invoices/use-get-invoices" 
import { columns } from "./columns" 
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Loader2, CalendarIcon, Plus, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SupportedFilters } from "@/components/ui/data-table-toolbar"
import { useGenerateInvoiceDialog } from "@/features/invoices/hooks/use-generate-invoice-dialog"
import { GenerateInvoiceDialog } from "@/features/invoices/components/generate-invoice-dialog"

const InvoicesPage = () => {
    const generateDialog = useGenerateInvoiceDialog()
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
        from: startOfMonth(subMonths(new Date(), 2)),
        to: endOfMonth(new Date()),
    }))

    const filters = useMemo(() => ({
        status: statusFilter,
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    }), [statusFilter, dateRange])

    const { data: invoices, isLoading } = useGetInvoices(filters)

    const invoiceTableFilters: SupportedFilters[] = ["globalSearch"]

    // Summary stats
    const totalAmount = useMemo(() => {
        if (!invoices) return 0
        return invoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0)
    }, [invoices])

    const statusCounts = useMemo(() => {
        if (!invoices) return { draft: 0, sent: 0, paid: 0, overdue: 0, partial: 0 }
        return invoices.reduce((acc, inv) => {
            const status = inv.status || "draft"
            acc[status] = (acc[status] || 0) + 1
            return acc
        }, {} as Record<string, number>)
    }, [invoices])

    return (
        <>
            <GenerateInvoiceDialog />
            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard/billing">Billing</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Invoices</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                        <p className="text-muted-foreground">
                            Track billing records by payer
                        </p>
                    </div>
                    <Button onClick={generateDialog.onOpen}>
                        <Plus className="size-4 mr-2" />
                        Generate Invoice
                    </Button>
                </div>

            {/* Quick Status Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={statusFilter === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(undefined)}
                >
                    All ({invoices?.length || 0})
                </Button>
                <Button
                    variant={statusFilter === "draft" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("draft")}
                >
                    Draft ({statusCounts.draft || 0})
                </Button>
                <Button
                    variant={statusFilter === "sent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("sent")}
                >
                    Sent ({statusCounts.sent || 0})
                </Button>
                <Button
                    variant={statusFilter === "paid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("paid")}
                >
                    Paid ({statusCounts.paid || 0})
                </Button>
                <Button
                    variant={statusFilter === "overdue" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("overdue")}
                >
                    Overdue ({statusCounts.overdue || 0})
                </Button>
            </div>

            {/* Date Range + Table */}
            <Card>
                <CardHeader className="pb-4 flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-5" />
                            Invoice Records
                        </CardTitle>
                        <CardDescription>
                            {invoices?.length || 0} invoices totaling{" "}
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "MMM d, yyyy")
                                        )
                                    ) : (
                                        <span>Filter by date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={invoices || []}
                            enabledFilters={invoiceTableFilters}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
        </>
    )
}

export default InvoicesPage