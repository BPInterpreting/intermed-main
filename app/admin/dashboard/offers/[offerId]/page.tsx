'use client'

import {useParams} from "next/navigation";
import {useGetIndividualOffer} from "@/features/appointments/api/use-get-individual-offer";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {format, parse, parseISO} from "date-fns";
import {Separator} from "@/components/ui/separator";
import {BadgeCheck, CalendarIcon, Hospital, Loader2, Mail, MapPinHouse, Phone, Printer, User} from "lucide-react";
import {appointmentOffers} from "@/db/schema";
import { columns } from "@/app/admin/dashboard/offers/[offerId]/columns";
import {DataTable} from "@/components/ui/data-table";
import { MonthPicker } from "@/components/ui/month-picker";
import {Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import {useState} from "react";
import { Progress } from "@/components/ui/progress"
import {cn} from "@/lib/utils";
import interpreters from "@/app/api/[[...route]]/interpreters";


const OfferClient = () => {
    const params = useParams();
    const offerId = params.offerId as string;
    const { data: offer, isLoading } = useGetIndividualOffer(offerId)

    const [progress, setProgress] = useState(13);
    const [date, setDate] = useState<Date>(new Date());

    // This code runs while the data is being fetched
    if (isLoading) {
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="size-8 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <div className='flex-1 space-y-4 p-8 pt-6'>
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard/offers">Offers</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Offer Details</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <h2 className="text-3xl font-bold tracking-tight">Booking ID #{offer?.bookingId}</h2>
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
                                    Offer Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className={'space-y-2'}>
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Created Date</span>
                                    <span>{offer?.createdAt
                                        ? format(parseISO(offer?.createdAt), 'PPP')
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
                                                <span className="text-sm text-muted-foreground">Patient</span>
                                                <span className="font-medium capitalize">
                                                    {offer?.patientName}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <CalendarIcon height={30} width={30} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Date and Time</span>
                                                <div className={'flex flex-col'}>
                                                    <span className="font-medium">{offer?.date ? format(parseISO(offer.date), "EEEE, MMMM d, yyyy") : "N/A"}</span>
                                                    <span className="font-medium">{offer?.startTime ? format(parse(offer.startTime, "HH:mm:ss", new Date()), "h:mm a") : "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <BadgeCheck height={32} width={32} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Offer Type</span>
                                                <span className="font-medium">
                                                    {offer?.isCertified ? "Certified" : "Qualified"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <Hospital height={30} width={30} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Facility</span>
                                                <div className={'flex flex-col '}>
                                                    <span className="font-medium capitalize">{offer?.facilityName}</span>
                                                    <span className="font-medium capitalize">{offer?.facilityAddress}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={'flex flex-row items-center space-x-2'}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" >
                                                <Phone height={30} width={30} />
                                            </div>
                                            <div className={'flex flex-col '}>
                                                <span className="text-sm text-muted-foreground">Phone Number</span>
                                                <div className={'flex flex-row items-center space-x-2'}>
                                                    <span className="font-medium">{offer?.facilityPhoneNumber || "No Phone Number On File"}</span>

                                                </div>
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/*Right column - 2/3 of space focus more on data table and bigger graphs*/}
                    <div className={'lg:col-span-2 space-y-1'}>
                        <Card>
                            <CardContent className="flex flex-row justify-between items-center p-2">
                                <div className={'flex flex-row space-x-5'}>
                                    <div>
                                        <div className="text-2xl font-bold">{offer.notifiedCount}</div>
                                        <p className="text-xs text-muted-foreground">TOTAL INTERPRETERS</p>
                                    </div>
                                    <div className={'pr-20'}>
                                        <p className="text-xs text-muted-foreground">Depletion Rate</p>
                                        <Progress value={progress} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/*Card for the Data Table*/}
                        <Card>
                            <CardHeader className='pb-4 flex flex-row justify-between'>
                                <div>
                                    <CardTitle> Interpreters </CardTitle>
                                    <CardDescription> List of interpreters who received offer </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/*    data Table goes here */}
                                <DataTable columns={columns} data={offer.interpreters} />
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>

        </>
    )
}

export default OfferClient;