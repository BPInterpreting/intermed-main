'use client'

import { useParams } from "next/navigation";
import {
    useGetIndividualAppointment
} from "@/features/appointments/api/use-get-individual-appointment";
import { useGetAppointmentBilling } from "@/features/billing/use-get-appointment-billing"; 
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Building, User, Hash, Stethoscope, UserCheck, DollarSign, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {Badge} from "@/components/ui/badge";
import dynamic from "next/dynamic";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useEditAppointment} from "@/features/appointments/api/use-edit-appointment";
import {useUpdateAppointment} from "@/features/appointments/hooks/use-update-appointment";
const GoogleMapComponent = dynamic(
    () => import('@/components/customUi/google-map'),
    {
        ssr: false,
        loading: () => <div className="flex h-full items-center justify-center bg-secondary"><p>Loading map...</p></div>
    }
);

// Helper to format time strings (e.g., "14:30:00" to "2:30 PM")
const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return 'N/A';
    try {
        const dummyDate = new Date(`1970-01-01T${timeString}`);
        return format(dummyDate, 'h:mm a');
    } catch {
        return timeString;
    }
};

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

// Helper to format duration
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
        return 'N/A'
    }

    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)

    if (hours === 0) {
        return `${mins}m`
    } else if (mins === 0) {
        return `${hours}h`
    } else {
        return `${hours}h ${mins}m`
    }
}

// Currency formatter
const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return "$0.00"
    const num = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(num)) return "$0.00"
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(num)
}

const AppointmentClient = () => {
    const params = useParams();
    const appointmentId = params.appointmentId as string;
    const editMutation = useEditAppointment(appointmentId);
    const {onOpen} = useUpdateAppointment()

    const { data: appointment, isLoading } = useGetIndividualAppointment(appointmentId);
    const billingQuery = useGetAppointmentBilling(appointmentId);
    const billingData = billingQuery.data;
    const billing = billingData?.billing;

    const patientFullName = `${appointment?.patientFirstName ?? ''} ${appointment?.patientLastName ?? ''}`.trim();

    const renderStatusBadges = () => {
        switch (appointment?.status) {
            case "Interpreter Requested":
                return (
                    <div>
                        <Badge variant={'interpreterRequested'}>
                            {appointment.status}
                        </Badge>
                    </div>
                )
            case "Cancelled":
                return (
                    <div>
                        <Badge variant={'cancelled'}>
                            {appointment.status}
                        </Badge>
                    </div>
                )
            case "Closed":
                return (
                    <div>
                        <Badge variant={'closed'}>
                            {appointment.status}
                        </Badge>
                    </div>
                )
            case "Pending Confirmation":
                return (
                    <div>
                        <Badge variant={'pendingConfirmation'}>
                            {appointment.status}
                        </Badge>
                    </div>
                )
            case "Pending Authorization":
                return (
                    <div>
                        <Badge variant={'pendingAuthorization'}>
                            {appointment.status}
                        </Badge>
                    </div>
                )
            case "Confirmed":
                return (
                    <div>
                        <Badge variant={'confirmed'}>
                            {appointment.status}
                        </Badge>
                    </div>

                )
            case "Late CX":
                return (
                    <div>
                        <Badge variant={'cancelled'}>
                            {appointment.status}
                        </Badge>
                    </div>
                )
            case "No Show":
                return (
                    <div>
                        <Badge variant={'cancelled'}>
                            {appointment.status}
                        </Badge>
                    </div>
                )
        }
    }

    if (isLoading) {
        return <AppointmentPageSkeleton />;
    }

    return (
        <div className='flex-1 space-y-4 p-8 pt-6'>
            {/* Header Section */}
            <div className="flex items-start justify-between">
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/admin/dashboard/appointments">Appointments</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Appointment Details</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h2 className="text-3xl font-bold tracking-tight">
                        BookingID #{appointment?.bookingId}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        onClick={() => onOpen(appointmentId)}
                    >
                        Edit
                    </Button>
                </div>
            </div>

            {/* Main Content Area - 2 column layout */}
            <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>

                {/* Left Column - 1/3 */}
                <div className={'space-y-4'}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Details</CardTitle>
                        </CardHeader>
                        <CardContent className={'space-y-4'}>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-semibold">{renderStatusBadges()}</span>
                            </div>
                            <Separator />

                            <div className={'flex flex-row items-center space-x-4'}>
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className={'flex flex-col'}>
                                    <span className="text-sm text-muted-foreground">Patient</span>
                                    <span className="font-medium">{patientFullName || 'N/A'}</span>
                                </div>
                            </div>
                            <div className={'flex flex-row items-center space-x-4'}>
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Building className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className={'flex flex-col'}>
                                    <span className="text-sm text-muted-foreground">Facility</span>
                                    <span className="font-medium">{appointment?.facilityName || 'N/A'}</span>
                                    <span className="font-medium">{appointment?.facilityAddress || 'N/A'}</span>
                                </div>
                            </div>
                            <div className={'flex flex-row items-center space-x-4'}>
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className={'flex flex-col'}>
                                    <span className="text-sm text-muted-foreground">Date</span>
                                    <span className="font-medium">{appointment?.date ? format(parseISO(appointment.date), 'EEEE, MMM d, yyyy') : 'N/A'}</span>
                                </div>
                            </div>
                            <div className={'flex flex-row items-center space-x-4'}>
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className={'flex flex-col'}>
                                    <span className="text-sm text-muted-foreground">Time</span>
                                    <span className="font-medium">{`${formatTime(appointment?.startTime)} - ${formatTime(appointment?.endTime)}`}</span>
                                </div>
                            </div>
                            <div className={'flex flex-row items-center space-x-4'}>
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className={'flex flex-col'}>
                                    <span className="text-sm text-muted-foreground">Duration</span>
                                    <span className="font-medium">{formatDuration(appointment?.actualDurationMinutes, appointment?.projectedDuration)}</span>
                                </div>
                            </div>
                            <div className={'flex flex-row items-center space-x-4'}>
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Stethoscope className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className={'flex flex-col'}>
                                    <span className="text-sm text-muted-foreground">Appointment Type</span>
                                    <span className="font-medium">{appointment?.appointmentType || 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - 2/3 */}
                <div className={'lg:col-span-2 space-y-4'}>
                    {/* Assigned Interpreter Card */}
                    <Card>
                        <CardContent className="flex flex-row justify-between items-center p-2">
                            <div className={'text-2xl font-bold'}>Assigned Interpreter</div>
                            {appointment?.interpreterId ? (
                                <div className={'flex flex-row items-center space-x-4'}>
                                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className={'flex flex-col'}>
                                        <span className="text-sm text-muted-foreground">Name</span>
                                        <span className="font-medium">{`${appointment.interpreterFirstName} ${appointment.interpreterLastName}`}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No interpreter assigned yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* ============================================================ */}
                    {/* BILLING SUMMARY CARD */}
                    {/* ============================================================ */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="size-5" />
                                    Billing Summary
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {appointment?.billingStatus && (
                                        <Badge variant={
                                            appointment.billingStatus === 'invoiced' ? 'default' :
                                            appointment.billingStatus === 'pending' ? 'secondary' :
                                            'outline'
                                        }>
                                            {appointment.billingStatus}
                                        </Badge>
                                    )}
                                    {appointment?.payoutStatus && (
                                        <Badge variant={
                                            appointment.payoutStatus === 'paid' ? 'default' :
                                            appointment.payoutStatus === 'scheduled' ? 'secondary' :
                                            'outline'
                                        }>
                                            Payout: {appointment.payoutStatus}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {appointment?.payerName && (
                                <CardDescription>
                                    Payer: {appointment.payerName}
                                    {appointment?.language && <> &middot; {appointment.language}</>}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {billingQuery.isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : billingQuery.isError || !billing ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                                    <AlertCircle className="size-4" />
                                    {!appointment?.payerId
                                        ? "No payer assigned — billing cannot be calculated"
                                        : "Unable to load billing details"
                                    }
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Warnings */}
                                    {billing.warnings && billing.warnings.length > 0 && (
                                        <div className="space-y-1">
                                            {billing.warnings.map((warning: string, i: number) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded p-2">
                                                    <AlertCircle className="size-3 shrink-0" />
                                                    {warning}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Two column: Payer Revenue | Interpreter Cost */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Payer (Revenue) */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payer Revenue</p>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Service</span>
                                                    <span>
                                                        {billing.billToInsurance.serviceHours}h × {formatCurrency(billing.billToInsurance.serviceRate)}/hr
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Service Amount</span>
                                                    <span className="font-medium">{formatCurrency(billing.billToInsurance.serviceAmount)}</span>
                                                </div>
                                                {billing.billToInsurance.mileageAmount > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Mileage</span>
                                                        <span>
                                                            {billing.billToInsurance.mileage} mi × {formatCurrency(billing.billToInsurance.mileageRate)}/mi
                                                        </span>
                                                    </div>
                                                )}
                                                {billing.billToInsurance.adjustmentType && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            {billing.billToInsurance.adjustmentType === 'no_show' ? 'No Show Fee' : 'Late CX Fee'}
                                                        </span>
                                                        <span className="text-amber-600">{formatCurrency(billing.billToInsurance.adjustmentAmount)}</span>
                                                    </div>
                                                )}
                                                <Separator />
                                                <div className="flex justify-between text-sm font-semibold">
                                                    <span>Total Revenue</span>
                                                    <span className="text-green-600">{formatCurrency(billing.billToInsurance.total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interpreter (Cost) */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Interpreter Cost</p>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Service</span>
                                                    <span>
                                                        {billing.payToInterpreter.serviceHours}h × {formatCurrency(billing.payToInterpreter.serviceRate)}/hr
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Service Amount</span>
                                                    <span className="font-medium">{formatCurrency(billing.payToInterpreter.serviceAmount)}</span>
                                                </div>
                                                {billing.payToInterpreter.mileageAmount > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Mileage</span>
                                                        <span>
                                                            {billing.payToInterpreter.mileage} mi × {formatCurrency(billing.payToInterpreter.mileageRate)}/mi
                                                        </span>
                                                    </div>
                                                )}
                                                {billing.payToInterpreter.adjustmentType && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            {billing.payToInterpreter.adjustmentType === 'no_show' ? 'No Show Fee' : 'Late CX Fee'}
                                                        </span>
                                                        <span className="text-amber-600">{formatCurrency(billing.payToInterpreter.adjustmentAmount)}</span>
                                                    </div>
                                                )}
                                                <Separator />
                                                <div className="flex justify-between text-sm font-semibold">
                                                    <span>Total Cost</span>
                                                    <span className="text-red-500">{formatCurrency(billing.payToInterpreter.total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profit / Margin Row */}
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="size-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Profit</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-bold ${billing.margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {formatCurrency(billing.margin)}
                                                </span>
                                                <Badge variant={billing.marginPercent >= 0 ? 'default' : 'destructive'}>
                                                    {billing.marginPercent.toFixed(1)}% margin
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Map Placeholder Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{appointment?.facilityName || "Location"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 rounded-b-lg overflow-hidden">
                            {appointment?.facilityLatitude && appointment?.facilityLongitude ? (
                                <GoogleMapComponent
                                    initialLatitude={Number(appointment.facilityLatitude)}
                                    initialLongitude={Number(appointment.facilityLongitude)}
                                    isDisplayOnly={true}
                                    initialZoom={17}
                                    height={250}
                                />
                            ) : (
                                <div className="h-[250px] flex items-center justify-center bg-secondary">
                                    <p className="text-muted-foreground">Location data not available.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Notes Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                            <CardDescription>Notes from the admin and interpreter</CardDescription>
                        </CardHeader>
                        <CardContent className={'flex flex-row gap-4'}>
                            <Card className='flex-1'>
                                <CardHeader>
                                    <CardTitle>Admin Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea>
                                        <p className="text-sm text-muted-foreground min-h-[80px] whitespace-pre-wrap">
                                            {appointment?.adminNotes || "No notes from admin."}
                                        </p>
                                    </ScrollArea>

                                </CardContent>
                            </Card>
                            <Card className='flex-1'>
                                <CardHeader>
                                    <CardTitle>Interpreter Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground min-h-[80px] whitespace-pre-wrap">
                                        {appointment?.interpreterNotes || "No notes from interpreter."}
                                    </p>
                                </CardContent>
                            </Card>
                        </CardContent>

                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AppointmentClient;



// A skeleton loader component to improve user experience
const AppointmentPageSkeleton = () => {
    return (
        <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-10 w-80" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-16" />
                </div>
            </div>
            <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
                <div className={'space-y-4'}>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <Skeleton className="h-5 w-full" />
                            <Separator />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className={'lg:col-span-2 space-y-4'}>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-[280px] w-full" />
                    <Skeleton className="h-[250px] w-full" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-72 mt-2" />
                        </CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}