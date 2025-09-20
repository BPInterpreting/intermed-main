'use client'

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CalendarIcon, DollarSign, Mail, MapPinHouse, Phone, Printer, User} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {useParams} from "next/navigation";
import {useGetIndividualInterpreter} from "@/features/interpreters/api/use-get-individual-interpreter";
import {client} from "@/lib/hono";
import {InferResponseType} from "hono";
import {DataTable} from "@/components/ui/data-table";
import {columns} from "@/app/admin/dashboard/interpreters/[interpreterId]/columns";
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";
import {MonthPicker} from "@/components/ui/month-picker";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {endOfMonth, format, isWithinInterval, parseISO, startOfMonth} from "date-fns";
import {useMemo, useState} from "react";
import {cn} from "@/lib/utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {SupportedFilters} from "@/components/ui/data-table-toolbar";
import {useUpdateInterpreter} from "@/features/interpreters/hooks/use-update-interpreter";

export type ResponseType = InferResponseType<typeof client.api.interpreters.$get, 200>['data'][0]

const InterpreterClient = () => {
    const params = useParams();
    const interpreterId = params.interpreterId as string;
    const interpreterQuery = useGetIndividualInterpreter(interpreterId)
    const interpreter = interpreterQuery.data as ResponseType | undefined
    const {onOpen} = useUpdateInterpreter()

    const appointmentsQuery = useGetAppointments(interpreterId)
    const appointments = appointmentsQuery.data || []

    const [date, setDate] = useState<Date>(new Date());
    // const [dates, setDates] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });

    const interpreterPageTableFilter: SupportedFilters[] = ['globalSearch']

    const filteredAppointments = useMemo(() => {
        if (!date) return appointments; // If no month selected, show all

        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        return appointments.filter(apt => {
            try {
                const aptDate = parseISO(apt.date);
                return isWithinInterval(aptDate, { start: monthStart, end: monthEnd });
            } catch (error) {
                console.error('Error parsing date:', apt.date);
                return false;
            }
        });
    }, [appointments, date])

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');

        // Helper function to format time
        const formatTime = (timeString: string | null) => {
            if (!timeString) return 'N/A';
            try {
                const dummyDate = new Date(`1970-01-01T${timeString}`);
                return format(dummyDate, 'h:mm a');
            } catch {
                return timeString;
            }
        };

        // Build table rows with end time included
        const appointmentRows = filteredAppointments.map(apt => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${format(parseISO(apt.date), 'PP')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${apt.patient} ${apt.patientLastName || ''}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${apt.facility || ''}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatTime(apt.startTime)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatTime(apt.endTime)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${apt.status || ''}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${apt.appointmentType || ''}</td>
            </tr>
        `).join('');

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Monthly Statement - ${interpreter?.firstName} ${interpreter?.lastName}</title>
                <style>
                    @page { size: landscape; margin: 0.5in; }
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { font-size: 24px; margin-bottom: 10px; }
                    .header-info { margin-bottom: 20px; }
                    .header-info p { margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    th { background-color: #f2f2f2; font-weight: bold; text-align: left; }
                    th, td { border: 1px solid #ddd; padding: 6px; }
                    .footer { margin-top: 20px; font-size: 10px; }
                    .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; }
                </style>
            </head>
            <body>
                <h1>Monthly Appointment Statement</h1>
                <div class="header-info">
                    <p><strong>Interpreter:</strong> ${interpreter?.firstName} ${interpreter?.lastName}</p>
                    <p><strong>Email:</strong> ${interpreter?.email}</p>
                    <p><strong>Phone:</strong> ${interpreter?.phoneNumber}</p>
                    <p><strong>Period:</strong> ${date ? format(date, 'MMMM yyyy') : 'All Time'}</p>
                    <p><strong>Total Appointments:</strong> ${filteredAppointments.length}</p>
                    <p><strong>Generated:</strong> ${format(new Date(), 'PPP')}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Patient</th>
                            <th>Facility</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Status</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointmentRows}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>This statement contains all ${filteredAppointments.length} appointments for the selected period.</p>
                    <p>© ${new Date().getFullYear()} - Confidential Medical Interpreter Records</p>
                </div>
            </body>
            </html>
        `;

        printWindow?.document.write(printContent);
        printWindow?.document.close();
        printWindow?.print();
    };

    return (
        <>
            <div className='flex-1 space-y-4 p-8 pt-6'>
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard/interpreters">Interpreters</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Interpreter Details</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <h2 className="text-3xl font-bold tracking-tight">{interpreter?.firstName} {interpreter?.lastName}</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onOpen(interpreterId)} variant="default">Edit</Button>
                    </div>
                </div>
                {/* Main Content Area - 2 column layout */}
                <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
                    {/* Left Column - 1/3 of the space */}
                    <div className={'space-y-4'}>
                        {/* Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Interpreter Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className={'space-y-2'}>
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Joined</span>
                                    <span>{interpreter?.createdAt
                                        ? format(parseISO(interpreter.createdAt), 'PPP')
                                        : 'N/A'
                                    }</span>
                                </div>
                                <Separator />
                                <div className={'space-y-4'}>
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <User height={32} width={32} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Interpreter Type</span>
                                                <span className="font-medium">
                                                    {interpreter?.isCertified ? "Certified" : "Qualified"}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <Mail height={30} width={30} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Email</span>
                                                <span className="font-medium">{interpreter?.email}</span>
                                            </div>

                                        </div>
                                    </div>
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <Phone height={30} width={30} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Phone</span>
                                                <span className="font-medium">{interpreter?.phoneNumber}</span>
                                            </div>

                                        </div>
                                    </div>
                                    {/*<div>*/}
                                    {/*    <div className={'flex flex-row items-center space-x-2'}>*/}
                                    {/*        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >*/}
                                    {/*            <DollarSign height={30} width={30} />*/}
                                    {/*        </div>*/}
                                    {/*        <div className={'flex flex-col '}>*/}
                                    {/*            <span className="text-sm text-muted-foreground">Rates</span>*/}
                                    {/*            <span className="font-medium">Minimum - $60/hr 2hr</span>*/}
                                    {/*            <span className="font-medium">Late Cancellation - $120</span>*/}
                                    {/*            <span className="font-medium">No Show - $120 + Mileage</span>*/}
                                    {/*        </div>*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <MapPinHouse height={30} width={30} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Billing Address</span>
                                                <span className="font-medium">{interpreter?.address}</span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                {/*Right column - 2/3 of space focus more on data table and bigger graphs*/}
                    <div className={'lg:col-span-2 space-y-1'}>
                        {/* Card for Sats such as total appointments */}
                        <Card>
                            <CardContent className="flex flex-row justify-between items-center p-2">
                                <div>
                                    <div className="text-2xl font-bold">{filteredAppointments.length}</div>
                                    <p className="text-xs text-muted-foreground">TOTAL APPOINTMENTS</p>
                                </div>
                            </CardContent>
                        </Card>
                        {/*Card for the Data Table*/}
                        <Card>
                            <CardHeader className='pb-4 flex flex-row justify-between'>
                                <div>
                                    <CardTitle>Appointments</CardTitle>
                                    <CardDescription> Recent and Upcoming Appointments </CardDescription>
                                </div>
                                <div>
                                    <Button
                                        onClick={handlePrint}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print Statement
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4 mb-2">
                                    <div className="flex gap-4">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date ? format(date, "MMM yyyy") : <span>Pick a month</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <MonthPicker onMonthSelect={(newDate) => setDate(newDate)} selectedMonth={date} variant={{ chevrons: "ghost" }}></MonthPicker>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            {/*    data Table goes here */}
                                <DataTable columns={columns} data={filteredAppointments} enabledFilters={interpreterPageTableFilter} />
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>

        </>
    );
}

export default InterpreterClient