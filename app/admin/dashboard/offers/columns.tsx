"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import {format, parse} from "date-fns";
import {Actions} from "@/app/admin/dashboard/appointments/actions";

export type ResponseType = InferResponseType<typeof client.api.appointments.offers.monitoring.$get, 200>["data"][0]

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "actions",
        header: "Actions",
        size:80,
        cell: ({ row }) => {
            return(
                <Actions id={row.original.id} />
            )
        }
    },
    {
        accessorKey: "bookingId",
        header: "Booking ID",
        size: 100
    },
    {
        accessorKey: "offerStatus", // 👈 Change this from "status"
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("offerStatus") as string

            // A cleaner switch statement for the new statuses
            switch (status) {
                case "Accepted":
                    return <Badge variant={'confirmed'}>{status}</Badge>;
                case "Sent":
                    return <Badge variant={'pendingConfirmation'}>{status}</Badge>;
                case "Pending":
                    return <Badge variant={'interpreterRequested'}>{status}</Badge>;
                case "All Declined":
                    return <Badge variant={'cancelled'}>{status}</Badge>
                default:
                    // Fallback for any other statuses like 'Cancelled'
                    return <Badge variant={'closed'}>{status}</Badge>;
            }
        }
    },
    {
        accessorKey: "facilityName",
        header: "Facility",
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Appointment Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        size: 200,
        cell: ({ row }) => {
            const date = row.getValue("date") as Date

            return(
                <span>
                    {format(date, "cccccc, PPP")}
                </span>
            )
        }
    },
    {
        accessorKey: "startTime",
        header: "Start Time",
        size: 90,
        cell: ({ row }) => {
            const timeString = row.getValue("startTime") as string
            const parsedTime = parse(timeString, "HH:mm:ss", new Date())
            const formattedTime = format(parsedTime, "hh:mm a")

            return(
                <span>
                    {formattedTime}
                </span>
            )
        }

    },
    {
        accessorKey: "offerSentAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date Offer Sent
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        size: 200,
        cell: ({ row }) => {
            const date = row.getValue("date") as Date

            return(
                <span>
                    {format(date, "cccccc, PPP")}
                </span>
            )
        }
    },


    // In your columns.tsx file, add this new object to the array

    {
        accessorKey: "acceptedBy",
        header: "Accepted By",
        cell: ({ row }) => {
            const acceptedBy = row.getValue("acceptedBy");
            // Conditionally render the name or a placeholder
            return acceptedBy ? (
                <span className="font-medium">{acceptedBy as string}</span>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        }
    },
    {
        header: "Responses",
        cell: ({ row }) => {
            const notified = row.original.notifiedCount || 0;
            const viewed = row.original.viewedCount || 0;
            const declined = row.original.declinedCount || 0;

            return (
                <div className="text-sm">
                    <div>{notified} notified</div>
                    <div>{viewed} viewed</div>
                    <div>{declined} declined</div>
                </div>
            );
        },
    },
];