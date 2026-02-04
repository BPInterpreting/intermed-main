'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, FileDown, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { useGetPayout } from "@/features/payouts/api/use-get-payout";
import { useMarkPayoutPaidDialog } from "@/features/payouts/hooks/use-mark-payout-paid-dialog";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table";

// Helper to parse projected duration strings like "5h", "45m", "1h30m"
const parseProjectedDuration = (duration: string): number | null => {
    if (!duration) return null

    const trimmed = duration.trim().toLowerCase()

    const hoursMinutesMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*h\s*(\d+)\s*m?/)
    if (hoursMinutesMatch) {
        const hours = parseFloat(hoursMinutesMatch[1])
        const mins = parseInt(hoursMinutesMatch[2])
        return (hours * 60) + mins
    }

    const hoursMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*h$/)
    if (hoursMatch) {
        return parseFloat(hoursMatch[1]) * 60
    }

    const minutesMatch = trimmed.match(/^(\d+)\s*m$/)
    if (minutesMatch) {
        return parseInt(minutesMatch[1])
    }

    const plainNumber = parseFloat(trimmed)
    if (!isNaN(plainNumber)) {
        if (plainNumber > 10) {
            return plainNumber
        } else {
            return plainNumber * 60
        }
    }

    return null
}

// Helper to format duration display
const formatDuration = (
    actualDuration: number | null | undefined,
    projectedDuration: string | null | undefined
) => {
    let minutes: number | null = null

    if (actualDuration && actualDuration > 0) {
        minutes = actualDuration
    } else if (projectedDuration) {
        minutes = parseProjectedDuration(projectedDuration)
    }

    if (minutes === null || minutes <= 0) {
        return '-'
    }

    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)

    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
}

// Helper to format time strings
const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return 'N/A'
    try {
        const parsedTime = parse(timeString, "HH:mm:ss", new Date())
        return format(parsedTime, "hh:mm a")
    } catch {
        return timeString
    }
}

// Status badge config for appointment statuses
const appointmentStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    "Closed": { label: "Closed", variant: "default" },
    "No Show": { label: "No Show", variant: "destructive" },
    "Late CX": { label: "Late CX", variant: "destructive" },
}

const PayoutDetailPage = () => {
    const params = useParams();
    const payoutId = params.payoutId as string;
    const payoutQuery = useGetPayout(payoutId);
    const payout = payoutQuery.data;
    const markPaidDialog = useMarkPayoutPaidDialog();

    if (payoutQuery.isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[500px]">
                    <Loader2 className="size-6 text-slate-300 animate-spin" />
                </div>
            </div>
        );
    }

    if (!payout) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[500px]">
                    <p className="text-muted-foreground">Payout not found</p>
                </div>
            </div>
        );
    }

    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
        pending: { label: "Pending", variant: "outline" },
        processing: { label: "Processing", variant: "secondary" },
        paid: { label: "Paid", variant: "default" },
        cancelled: { label: "Cancelled", variant: "destructive" },
    }

    const config = statusConfig[payout.status] || { label: payout.status, variant: "outline" }

    const canMarkPaid = payout.status === "pending"

    const total = parseFloat(payout.total || "0")
    
    // Calculate totals from line items
    const lineItems = payout.lineItems || []
    const totalHours = lineItems.reduce((sum, item) => sum + parseFloat(item.serviceHours || "0"), 0)
    const totalMileage = lineItems.reduce((sum, item) => sum + parseFloat(item.mileage || "0"), 0)
    const serviceTotal = lineItems.reduce((sum, item) => {
        const hours = parseFloat(item.serviceHours || "0")
        const rate = parseFloat(item.serviceRate || "0")
        return sum + (hours * rate)
    }, 0)
    const mileageTotal = lineItems.reduce((sum, item) => {
        const miles = parseFloat(item.mileage || "0")
        const rate = parseFloat(item.mileageRate || "0")
        return sum + (miles * rate)
    }, 0)

    const interpreterName = `${payout.interpreterFirstName || ''} ${payout.interpreterLastName || ''}`.trim()

    return (
        <>
            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard/payouts">Payouts</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Payout Details</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="flex items-center gap-3 mt-1">
                            <h2 className="text-3xl font-bold tracking-tight font-mono">
                                {payout.payoutNumber}
                            </h2>
                            <Badge variant={config.variant}>
                                {config.label}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{interpreterName}</p>
                    </div>
                    <div className="flex gap-2">
                        {canMarkPaid && (
                            <Button onClick={() => markPaidDialog.onOpen(payoutId)}>
                                <CheckCircle className="size-4 mr-2" />
                                Mark as Paid
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <a href={`/api/payouts/${payoutId}/export`} download>
                                <FileDown className="size-4 mr-2" />
                                Export CSV
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="flex flex-col p-6">
                            <span className="text-sm text-muted-foreground">Period</span>
                            <span className="text-lg font-bold">
                                {payout.periodStart && payout.periodEnd ? (
                                    `${format(new Date(payout.periodStart), "MMM d")} - ${format(new Date(payout.periodEnd), "MMM d")}`
                                ) : "-"}
                            </span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex flex-col p-6">
                            <span className="text-sm text-muted-foreground">Appointments</span>
                            <span className="text-lg font-bold">{lineItems.length}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex flex-col p-6">
                            <span className="text-sm text-muted-foreground">Total Hours</span>
                            <span className="text-lg font-bold">{totalHours.toFixed(1)}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex flex-col p-6">
                            <span className="text-sm text-muted-foreground">Total Mileage</span>
                            <span className="text-lg font-bold">{totalMileage.toFixed(0)} mi</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex flex-col p-6">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="text-lg font-bold text-green-600">${total.toFixed(2)}</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                    {/* Left Column - Payout Details */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Interpreter</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{interpreterName}</p>
                                        <p className="text-sm text-muted-foreground">{payout.interpreterEmail}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payout Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created</span>
                                    <span>
                                        {payout.createdAt 
                                            ? format(new Date(payout.createdAt), "PPP")
                                            : "-"}
                                    </span>
                                </div>
                                <Separator />
                                {payout.paidAt && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Paid</span>
                                            <span>{format(new Date(payout.paidAt), "PPP")}</span>
                                        </div>
                                        <Separator />
                                    </>
                                )}
                                {payout.paymentMethod && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Payment Method</span>
                                            <span className="capitalize">{payout.paymentMethod}</span>
                                        </div>
                                        <Separator />
                                    </>
                                )}
                                {payout.paymentReference && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reference</span>
                                        <span className="font-mono">{payout.paymentReference}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service ({totalHours.toFixed(1)} hrs)</span>
                                    <span>${serviceTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mileage ({totalMileage.toFixed(0)} mi)</span>
                                    <span>${mileageTotal.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-green-600">${total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {payout.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {payout.notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Line Items */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Line Items ({lineItems.length})</CardTitle>
                                <CardDescription>
                                    Appointments included in this payout
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {lineItems.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Patient</TableHead>
                                                    <TableHead>Facility</TableHead>
                                                    <TableHead>Start</TableHead>
                                                    <TableHead>End</TableHead>
                                                    <TableHead>Duration</TableHead>
                                                    <TableHead className="text-right">Hours</TableHead>
                                                    <TableHead className="text-right">Rate</TableHead>
                                                    <TableHead className="text-right">Miles</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {lineItems.map((item) => {
                                                    const hours = parseFloat(item.serviceHours || "0")
                                                    const rate = parseFloat(item.serviceRate || "0")
                                                    const miles = parseFloat(item.mileage || "0")
                                                    const lineTotal = parseFloat(item.lineTotal || "0")

                                                    const statusConf = (item.appointmentStatus && appointmentStatusConfig[item.appointmentStatus]) || { 
                                                        label: item.appointmentStatus || "-", 
                                                        variant: "outline" as const 
                                                    }
                                                    
                                                    return (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="whitespace-nowrap">
                                                                {item.serviceDate 
                                                                    ? format(new Date(item.serviceDate), "MMM d")
                                                                    : "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={statusConf.variant} className="whitespace-nowrap">
                                                                    {statusConf.label}
                                                                </Badge>
                                                                {item.adjustmentType && (
                                                                    <Badge variant="secondary" className="mt-1 whitespace-nowrap">
                                                                        {item.adjustmentType.replace("_", " ").toUpperCase()}
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {item.patientName || "-"}
                                                            </TableCell>
                                                            <TableCell className="max-w-[150px]">
                                                                <div className="truncate">
                                                                    {item.facilityName || "-"}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {formatTime(item.startTime)}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {formatTime(item.endTime)}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {formatDuration(item.actualDurationMinutes, item.projectedDuration)}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {item.adjustmentType ? "-" : hours.toFixed(1)}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {item.adjustmentType ? "-" : `$${rate.toFixed(2)}`}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {miles > 0 ? miles.toFixed(0) : "-"}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                ${lineTotal.toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell colSpan={10} className="text-right font-medium">
                                                        Total
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        ${total.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No line items found.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PayoutDetailPage;