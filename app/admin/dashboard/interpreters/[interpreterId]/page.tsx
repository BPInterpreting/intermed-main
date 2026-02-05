'use client'

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CalendarIcon, DollarSign, Mail, MapPinHouse, Phone, Printer, User, Plus, Edit} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {useParams} from "next/navigation";
import {useGetIndividualInterpreter} from "@/features/interpreters/api/use-get-individual-interpreter";
import { useGetInterpreterRateHistory } from "@/features/interpreters/api/use-get-interpreter-rate-history"; 
import {useNewInterpreterRate} from "@/features/interpreters/hooks/use-new-interpreter-rate";
import {useOpenInterpreterRate} from "@/features/interpreters/hooks/use-open-interpreter-rate";
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
    BreadcrumbList, 
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {SupportedFilters} from "@/components/ui/data-table-toolbar";
import {useUpdateInterpreter} from "@/features/interpreters/hooks/use-update-interpreter";
import {Badge} from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type ResponseType = InferResponseType<typeof client.api.interpreters.$get, 200>['data'][0]

const InterpreterClient = () => {
    const params = useParams();
    const interpreterId = params.interpreterId as string;
    const interpreterQuery = useGetIndividualInterpreter(interpreterId)
    const interpreter = interpreterQuery.data as ResponseType | undefined
    const {onOpen} = useUpdateInterpreter()

    // Rates
    const ratesQuery = useGetInterpreterRateHistory(interpreterId)
    const rates = ratesQuery.data || []
    const newRateDialog = useNewInterpreterRate()
    const openRateDialog = useOpenInterpreterRate()

    // Find current rate (no end date)
    const currentRate = Array.isArray(rates) ? rates.find(r => !r.endDate) : null

    const appointmentsQuery = useGetAppointments(interpreterId)
    const appointments = appointmentsQuery.data || []

    const [date, setDate] = useState<Date>(new Date());

    const interpreterPageTableFilter: SupportedFilters[] = ['globalSearch']

    const filteredAppointments = useMemo(() => {
        if (!date) return appointments;

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

        const formatTime = (timeString: string | null) => {
            if (!timeString) return 'N/A';
            try {
                const dummyDate = new Date(`1970-01-01T${timeString}`);
                return format(dummyDate, 'h:mm a');
            } catch {
                return timeString;
            }
        };

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
                                <CardTitle>Interpreter Details</CardTitle>
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
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <DollarSign height={30} width={30} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Payment Frequency</span>
                                                <span className="font-medium capitalize">{interpreter?.paymentFrequency || "monthly"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Rate Card */}
                        <Card>
                        <CardHeader className="pb-3 flex flex-row justify-between items-center">
                                <CardTitle>Current Rate</CardTitle>
                                {currentRate ? (
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => openRateDialog.onOpen(interpreterId, currentRate.id)}
                                        >
                                            <Edit className="size-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button 
                                            size="sm"
                                            onClick={() => newRateDialog.onOpen(interpreterId)}
                                        >
                                            <Plus className="size-4 mr-2" />
                                            New Rate
                                        </Button>
                                    </div>
                                ) : (
                                    <Button 
                                        size="sm"
                                        onClick={() => newRateDialog.onOpen(interpreterId)}
                                    >
                                        <Plus className="size-4 mr-2" />
                                        Add Rate
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {currentRate ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Certified Rate</span>
                                            <span className="font-bold text-green-600">
                                                ${parseFloat(currentRate.certifiedHourlyRate).toFixed(2)}/hr
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Qualified Rate</span>
                                            <span className="font-medium">
                                                {currentRate.qualifiedHourlyRate 
                                                    ? `$${parseFloat(currentRate.qualifiedHourlyRate).toFixed(2)}/hr`
                                                    : <span className="text-muted-foreground italic text-sm">Same as certified</span>
                                                }
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Minimum Hours</span>
                                            <span>{currentRate.minimumHours || '2.00'} hrs</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mileage Rate</span>
                                            <span>${parseFloat(currentRate.mileageRate || '0').toFixed(2)}/mi</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Accepts No Mileage</span>
                                            <Badge variant={currentRate.acceptsNoMileage ? "default" : "secondary"}>
                                                {currentRate.acceptsNoMileage ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Late Cancel (Cert/Qual)</span>
                                            <span>
                                                ${parseFloat(currentRate.certifiedLateCancelFee || '0').toFixed(2)} / ${parseFloat(currentRate.qualifiedLateCancelFee || '0').toFixed(2)}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">No Show (Cert/Qual)</span>
                                            <span>
                                                ${parseFloat(currentRate.certifiedNoShowFee || '0').toFixed(2)} / ${parseFloat(currentRate.qualifiedNoShowFee || '0').toFixed(2)}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Effective Since</span>
                                            <span>{format(new Date(currentRate.effectiveDate), 'PPP')}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        <DollarSign className="size-8 mx-auto mb-2 opacity-50" />
                                        <p>No rate configured</p>
                                        <p className="text-sm">Add a rate to enable payout generation.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rate History Card */}
                        {Array.isArray(rates) && rates.length > 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rate History</CardTitle>
                                    <CardDescription>Previous rate configurations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Effective</TableHead>
                                                <TableHead>Certified</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rates.map((rate) => (
                                                <TableRow 
                                                    key={rate.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => openRateDialog.onOpen(interpreterId, rate.id)}
                                                >
                                                    <TableCell className="text-sm">
                                                        {format(new Date(rate.effectiveDate), "MMM d, yyyy")}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        ${parseFloat(rate.certifiedHourlyRate).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {!rate.endDate ? (
                                                            <Badge variant="default">Current</Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">
                                                                Ended {format(new Date(rate.endDate), "MMM d")}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right column - 2/3 of space */}
                    <div className={'lg:col-span-2 space-y-1'}>
                        {/* Stats Card */}
                        <Card>
                            <CardContent className="flex flex-row justify-between items-center p-2">
                                <div>
                                    <div className="text-2xl font-bold">{filteredAppointments.length}</div>
                                    <p className="text-xs text-muted-foreground">TOTAL APPOINTMENTS</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appointments Card */}
                        <Card>
                            <CardHeader className='pb-4 flex flex-row justify-between'>
                                <div>
                                    <CardTitle>Appointments</CardTitle>
                                    <CardDescription>Recent and Upcoming Appointments</CardDescription>
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