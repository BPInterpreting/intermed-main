'use client'

import {Heading} from "@/components/customUi/heading";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import HeadingContainer from "@/components/customUi/headingContainer";
import {DataTable} from "@/components/ui/data-table";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Plus} from "lucide-react";
import {columns} from "@/app/(dashboard)/facilities/components/columns";


type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

const data: Payment[] = [
    {
        id: "728ed52f",
        amount: 100,
        status: "pending",
        email: "m@example.com",
    },
    {
        id: "489e1d42",
        amount: 125,
        status: "processing",
        email: "example@gmail.com",
    },
    // ...
]


const FacilitiesClient = (
) => {
    return (
        <div className='w-full pb-10'>
            <Card className='border-none shadow-none'>
                <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                    <CardTitle>Medical Facilities</CardTitle>
                    <Button>
                        <Plus className='size-4 mr-2' />
                        Add Facility
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={data} />
                </CardContent>
            </Card>
        </div>
    )
}

export default FacilitiesClient;

