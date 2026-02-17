'use client'

import { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns"
import { useGetInvoices } from "@/features/invoices/api/use-get-invoices" 
import { columns } from "./columns" 
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, CalendarIcon, Plus, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
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

type DatePreset = "this_month" | "last_month" | "last_3_months" | "ytd" | "all" | "custom"

const getPresetRange = (preset: DatePreset): DateRange | undefined => {
    const now = new Date()
    switch (preset) {
        case "this_month":
            return { from: startOfMonth(now), to: endOfMonth(now) }
        case "last_month":
            return { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) }
        case "last_3_months":
            return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) }
        case "ytd":
            return { from: startOfYear(now), to: endOfMonth(now) }
        case "all":
            return undefined
        case "custom":
            return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) }
    }
}

const presetLabels: Record<DatePreset, string> = {
    this_month: "This Month",
    last_month: "Last Month",
    last_3_months: "Last 3 Months",
    ytd: "Year to Date",
    all: "All Time",
    custom: "Custom",
}

const InvoicesPage = () => {
    const generateDialog = useGenerateInvoiceDialog()
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
    const [activePreset, setActivePreset] = useState<DatePreset>("last_3_months")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getPresetRange("last_3_months"))
    const [customOpen, setCustomOpen] = useState(false)

    const handlePresetChange = (preset: DatePreset) => {
        setActivePreset(preset)
        if (preset === "custom") {
            setCustomOpen(true)
        } else {
            setDateRange(getPresetRange(preset))
        }
    }

    const handleCustomDateChange = (range: DateRange | undefined) => {
        setDateRange(range)
        setActivePreset("custom")
    }

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

    // Display label for current date range
    const dateRangeLabel = useMemo(() => {
        if (activePreset === "all") return "All Time"
        if (!dateRange?.from) return "All Time"
        if (!dateRange.to) return format(dateRange.from, "MMM d, yyyy")
        return `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
    }, [dateRange, activePreset])

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
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="size-5" />
                                    Invoice Records
                                </CardTitle>
                                <CardDescription>
                                    {invoices?.length || 0} invoices totaling{" "}
                                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)}
                                    {activePreset !== "all" && (
                                        <span className="ml-1">· {dateRangeLabel}</span>
                                    )}
                                </CardDescription>
                            </div>

                            {/* Date Preset Buttons */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {(["this_month", "last_month", "last_3_months", "ytd", "all"] as DatePreset[]).map((preset) => (
                                    <Button
                                        key={preset}
                                        variant={activePreset === preset ? "default" : "ghost"}
                                        size="sm"
                                        className="text-xs h-7 px-2.5"
                                        onClick={() => handlePresetChange(preset)}
                                    >
                                        {presetLabels[preset]}
                                    </Button>
                                ))}

                                {/* Custom Date Picker */}
                                <Popover open={customOpen} onOpenChange={setCustomOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={activePreset === "custom" ? "default" : "ghost"}
                                            size="sm"
                                            className="text-xs h-7 px-2.5"
                                            onClick={() => setCustomOpen(true)}
                                        >
                                            <CalendarIcon className="size-3 mr-1" />
                                            {activePreset === "custom" ? dateRangeLabel : "Custom"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={(range) => {
                                                handleCustomDateChange(range)
                                                if (range?.from && range?.to) {
                                                    setCustomOpen(false)
                                                }
                                            }}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
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