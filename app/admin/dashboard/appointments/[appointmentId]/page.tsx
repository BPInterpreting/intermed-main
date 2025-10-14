'use client'

import { useParams } from "next/navigation";
import {
    useGetIndividualAppointment
} from "@/features/appointments/api/use-get-individual-appointment";
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
import { Calendar, Clock, Building, User, Hash, Stethoscope, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {Badge} from "@/components/ui/badge";

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

const AppointmentClient = () => {
    const params = useParams();
    const appointmentId = params.appointmentId as string;

    const { data: appointment, isLoading } = useGetIndividualAppointment(appointmentId);

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
                        {
                            patientFullName
                                ? `${patientFullName} on ${appointment?.date ? format(parseISO(appointment.date), 'PPP') : 'Date TBD'}`
                                : 'Appointment Details'
                        }
                    </h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Assign Interpreter</Button>
                    <Button variant="default">Edit</Button>
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

                            {/* Inlined Detail Items */}
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
                                    <Stethoscope className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className={'flex flex-col'}>
                                    <span className="text-sm text-muted-foreground">Appointment Type</span>
                                    <span className="font-medium">{appointment?.appointmentType || 'N/A'}</span>
                                </div>
                            </div>
                            {/*<div className={'flex flex-row items-center space-x-4'}>*/}
                            {/*    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">*/}
                            {/*        <Hash className="h-5 w-5 text-muted-foreground" />*/}
                            {/*    </div>*/}
                            {/*    <div className={'flex flex-col'}>*/}
                            {/*        <span className="text-sm text-muted-foreground">Confirmation #</span>*/}
                            {/*        <span className="font-medium">{appointment?.confirmationNumber || 'N/A'}</span>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - 2/3 */}
                <div className={'lg:col-span-2 space-y-4'}>
                    {/* Map Placeholder Card */}
                    <Card>
                        <CardContent className="h-[250px] flex items-center justify-center bg-secondary rounded-lg p-6">
                            <p className="text-muted-foreground">Map Placeholder</p>
                        </CardContent>
                    </Card>

                    {/* Assigned Interpreter Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Interpreter</CardTitle>
                        </CardHeader>
                        <CardContent>
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

                    {/* Available Interpreters Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Interpreters</CardTitle>
                            <CardDescription>Qualified interpreters for this appointment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Available Interpreters DataTable will be placed here.</p>
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
                    <Skeleton className="h-[250px] w-full" />
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-56" />
                            <Skeleton className="h-4 w-72 mt-2" />
                        </CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

