"use client";

import { useGetOfferMonitoring } from "@/features/appointments/api/use-get-offer-monitoring";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {useNewAppointment} from "@/features/appointments/hooks/use-new-appointments";

export default function OffersMonitoringPage() {
    const offersQuery = useGetOfferMonitoring();
    const offers = offersQuery.data || []
    const newAppointment = useNewAppointment()


    return (
    <>
        <div className='flex-1 px-4 w-full pb-10'>
            <Card className='border-none shadow-none'>
                <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                    <CardTitle className='text-3xl line-clamp-1'>Current Offers</CardTitle>
                    <Button
                        onClick={newAppointment.onOpen}
                    >
                        <Plus className='size-4 mr-2'/>
                        Add Appointment
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={offers}   />
                </CardContent>
            </Card>
        </div>
    </>
    );
}