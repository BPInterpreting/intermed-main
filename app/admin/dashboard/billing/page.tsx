'use client'

import { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfYear } from "date-fns"
import { useGetBillingDashboard } from "@/features/billing/use-get-billing-dashboard" 
import {
    CalendarIcon,
    DollarSign,
    FileText,
    AlertTriangle,
    TrendingUp,
    Users,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Receipt,
    Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// ============================================================================
// HELPER: Format currency
// ============================================================================
const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(num)
}

// ============================================================================
// PRESET DATE RANGES
// ============================================================================
type PresetKey = "this_month" | "last_month" | "this_week" | "this_year" | "custom"

const getPresetRange = (preset: PresetKey): { from: Date; to: Date } => {
    const now = new Date()
    switch (preset) {
        case "this_month":
            return { from: startOfMonth(now), to: endOfMonth(now) }
        case "last_month":
            return { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) }
        case "this_week":
            return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
        case "this_year":
            return { from: startOfYear(now), to: now }
        default:
            return { from: startOfMonth(now), to: endOfMonth(now) }
    }
}

// ============================================================================
// MAIN BILLING DASHBOARD PAGE
// ============================================================================
const BillingDashboardPage = () => {
    const [preset, setPreset] = useState<PresetKey>("this_month")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const range = getPresetRange("this_month")
        return { from: range.from, to: range.to }
    })

    // Build filters for the hook
    const filters = useMemo(() => ({
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    }), [dateRange])

    const { data, isLoading, error } = useGetBillingDashboard(filters)

    // Handle preset selection
    const handlePresetChange = (value: string) => {
        const key = value as PresetKey
        setPreset(key)
        if (key !== "custom") {
            const range = getPresetRange(key)
            setDateRange({ from: range.from, to: range.to })
        }
    }

    // Handle custom date range
    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range)
        setPreset("custom")
    }

    // Derived values
    const totalOutstanding = parseFloat(data?.outstanding?.total || "0")
    const totalOverdue = parseFloat(data?.overdue?.total || "0")
    const totalInvoiced = parseFloat(data?.revenue?.totalInvoiced || "0")
    const totalPaid = parseFloat(data?.revenue?.totalPaid || "0")
    const totalPayouts = parseFloat(data?.payouts?.total || "0")
    const totalPaidOut = parseFloat(data?.payouts?.totalPaid || "0")
    const pendingPayouts = parseFloat(data?.pendingPayouts?.total || "0")
    const grossMargin = parseFloat(data?.margin?.gross || "0")
    const marginPercent = parseFloat(data?.margin?.percent || "0")
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0

    if (error) {
        return (
            <div className="flex-1 p-8 pt-6">
                <Card className="p-8 text-center">
                    <AlertTriangle className="size-8 mx-auto mb-2 text-destructive" />
                    <p className="text-destructive">Error loading billing dashboard.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Billing Dashboard</h2>
                    <p className="text-muted-foreground">
                        Financial overview and invoice tracking
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={preset} onValueChange={handlePresetChange}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this_week">This Week</SelectItem>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="this_year">This Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "MMM d, yyyy")} -{" "}
                                            {format(dateRange.to, "MMM d, yyyy")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "MMM d, yyyy")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    {/* ============================================================ */}
                    {/* ROW 1: Top-Level Financial Stats - Compact Row */}
                    {/* ============================================================ */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">Total Invoiced</p>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(totalInvoiced)}</p>
                            <p className="text-xs text-muted-foreground">{data?.revenue?.invoiceCount || 0} invoices</p>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(totalPaid)}</p>
                            <p className="text-xs text-muted-foreground">{collectionRate.toFixed(0)}% collection rate</p>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold mt-1 text-amber-600">{formatCurrency(totalOutstanding)}</p>
                            <p className="text-xs text-muted-foreground">{data?.outstanding?.count || 0} unpaid invoices</p>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                            </div>
                            <p className={cn("text-2xl font-bold mt-1", totalOverdue > 0 && "text-destructive")}>{formatCurrency(totalOverdue)}</p>
                            <p className="text-xs text-muted-foreground">{data?.overdue?.count || 0} overdue invoices</p>
                        </Card>
                    </div>

                    {/* ============================================================ */}
                    {/* ROW 2: Margin + Payouts + Appointments Overview */}
                    {/* ============================================================ */}
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                        {/* Gross Margin Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                                <CardDescription>Revenue minus interpreter payouts</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-2">
                                    <span className={cn("text-3xl font-bold", grossMargin >= 0 ? "text-green-600" : "text-destructive")}>
                                        {formatCurrency(grossMargin)}
                                    </span>
                                    <Badge variant={grossMargin >= 0 ? "default" : "destructive"} className="text-xs">
                                        {grossMargin >= 0 ? (
                                            <ArrowUpRight className="size-3 mr-1" />
                                        ) : (
                                            <ArrowDownRight className="size-3 mr-1" />
                                        )}
                                        {marginPercent.toFixed(1)}%
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Revenue (Collected)</span>
                                        <span className="font-medium">{formatCurrency(totalPaid)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Interpreter Payouts</span>
                                        <span className="font-medium">-{formatCurrency(totalPaidOut)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payout Summary Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Interpreter Payouts</CardTitle>
                                <CardDescription>Payments owed to interpreters</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-3xl font-bold">{formatCurrency(totalPayouts)}</div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Paid Out</span>
                                        <span className="font-medium text-green-600">{formatCurrency(totalPaidOut)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Pending</span>
                                        <span className="font-medium text-amber-600">{formatCurrency(pendingPayouts)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Payouts</span>
                                        <span className="font-medium">{data?.payouts?.count || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appointment Billing Overview */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Appointment Overview</CardTitle>
                                <CardDescription>Billing status of appointments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-3xl font-bold">{data?.appointments?.total || 0}</div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Completed</span>
                                        <span className="font-medium">{data?.appointments?.completed || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">No Shows</span>
                                        <span className="font-medium">{data?.appointments?.noShow || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Late Cancellations</span>
                                        <span className="font-medium">{data?.appointments?.lateCancel || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ============================================================ */}
                    {/* ROW 3: Pending Actions + Collection Progress */}
                    {/* ============================================================ */}
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {/* Collection Progress */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Collection Progress</CardTitle>
                                <CardDescription>How much of invoiced revenue has been collected</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Collected</span>
                                        <span className="font-medium">{collectionRate.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={collectionRate} className="h-3" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{formatCurrency(totalPaid)} collected</span>
                                        <span>{formatCurrency(totalInvoiced)} invoiced</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Payout Coverage</span>
                                        <span className="font-medium">
                                            {totalPayouts > 0 ? ((totalPaidOut / totalPayouts) * 100).toFixed(1) : "0"}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={totalPayouts > 0 ? (totalPaidOut / totalPayouts) * 100 : 0}
                                        className="h-3"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{formatCurrency(totalPaidOut)} paid out</span>
                                        <span>{formatCurrency(totalPayouts)} owed</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Actions */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                                <CardDescription>Items that need your attention</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                                            <Receipt className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Appointments Pending Billing</p>
                                            <p className="text-xs text-muted-foreground">Ready to be added to invoices</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-lg px-3">
                                        {data?.appointments?.pendingBilling || 0}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Appointments Pending Payout</p>
                                            <p className="text-xs text-muted-foreground">Need payout generation</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-lg px-3">
                                        {data?.appointments?.pendingPayout || 0}
                                    </Badge>
                                </div>

                                {totalOverdue > 0 && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Overdue Invoices</p>
                                                <p className="text-xs text-muted-foreground">Past due date, follow up needed</p>
                                            </div>
                                        </div>
                                        <Badge variant="destructive" className="text-lg px-3">
                                            {data?.overdue?.count || 0}
                                        </Badge>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Pending Interpreter Payouts</p>
                                            <p className="text-xs text-muted-foreground">Awaiting payment processing</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-lg px-3">
                                        {data?.pendingPayouts?.count || 0}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}

export default BillingDashboardPage