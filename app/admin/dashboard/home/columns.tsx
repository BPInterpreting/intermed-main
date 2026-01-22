"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from '@/app/admin/dashboard/appointments/actions';
import {format, parse, parseISO, isValid} from "date-fns"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button";
import {ArrowUpDown, CalendarClock} from "lucide-react";
import Link from "next/link";

// This is a type definition for the data that will be returned from the API part of the GitHub v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.appointments.$get, 200>["data"][0]

export const columns: ColumnDef<ResponseType>[] = [
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
        accessorKey: 'bookingId',
        header: 'Booking ID',
        size: 120,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 200,
        cell: ({ row }) => {

            switch (row.original.status) {
                case "Interpreter Requested":
                    return (
                        <div>
                            <Badge variant={'interpreterRequested'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Cancelled":
                    return (
                        <div>
                            <Badge variant={'cancelled'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Closed":
                    return (
                        <div>
                            <Badge variant={'closed'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Pending Confirmation":
                    return (
                        <div>
                            <Badge variant={'pendingConfirmation'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Pending Authorization":
                    return (
                        <div>
                            <Badge variant={'pendingAuthorization'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "Confirmed":
                    return (
                        <div>
                            <Badge variant={'confirmed'}>
                                {row.original.status}
                            </Badge>
                        </div>

                    )
                case "Late CX":
                    return (
                        <div>
                            <Badge variant={'cancelled'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
                case "No Show":
                    return (
                        <div>
                            <Badge variant={'cancelled'}>
                                {row.original.status}
                            </Badge>
                        </div>
                    )
            }
        }
    },
    {
        accessorKey: "patient",
        header: "Patient",
        cell: ({ row }) => {
            return (
                <div>
                    {row.original.patient} {row.original.patientLastName}
                </div>
            )
        }

    },
    {
        accessorKey: "facility",
        header: "Facility",
        size: 300
    },
    {
        accessorKey: "startTime",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Start Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
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
        // This combines first and last name for display and allows filtering on the full name
        accessorFn: (row) => `${row.interpreterFirstName || ''} ${row.interpreterLastName || ''}`.trim(),
        id: "interpreter", // This ID MUST match the filter key in the toolbar
        header: "Interpreter",
        filterFn: (row, id, value) => { // This filter function allows selecting multiple interpreters
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "appointmentType",
        header: "Appointment Type",
    },
    {
        accessorKey: 'isCertified',
        header: 'isCertified',
    },
    {
        accessorKey: "notes",
        header: "Notes",
        size: 350,
        cell: ({ row }) => {
            const notes = row.getValue("notes") as string;

            if (!notes) return <span>-</span>;

            // Your new facility address handling
            if (notes.includes('New Facility Address:')) {
                const parts = notes.split('New Facility Address:');
                const regularNotes = parts[0].trim();
                const newAddress = parts[1].trim();

                return (
                    <div className="space-y-2 whitespace-normal break-words">
                        {regularNotes && <p>{regularNotes}</p>}
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-600">⚠️</span>
                                <span className="font-semibold text-yellow-800 text-sm">
                                New Facility Address:
                            </span>
                            </div>
                            <p className="text-yellow-700 text-sm mt-1 break-all">
                                {newAddress}
                            </p>
                        </div>
                    </div>
                );
            }
            return (
                <div className="whitespace-normal break-words">
                    {notes}
                </div>
            );
        }
    },
    {
        accessorKey: "nextFollowUpDate",
        header: "Next Follow Up",
        size: 180,
        cell: ({ row }) => {
            const followUpId = row.original.nextFollowUpId;
            const dateValue = row.original.nextFollowUpDate;
            const timeValue = row.original.nextFollowUpTime;

            if (!dateValue || !followUpId) {
                return <span className="text-muted-foreground">-</span>;
            }

            try {
                // Parse the date
                const parsedDate = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
                const formattedDate = isValid(parsedDate) ? format(parsedDate, "MMM d, yyyy") : '-';

                // Parse the time if available
                let formattedTime = '';
                if (timeValue) {
                    const parsedTime = parse(timeValue as string, "HH:mm:ss", new Date());
                    if (isValid(parsedTime)) {
                        formattedTime = format(parsedTime, "h:mm a");
                    }
                }

                return (
                    <Link 
                        href={`/admin/dashboard/appointments/${followUpId}`}
                        className="flex items-center gap-2 hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors"
                    >
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-primary hover:underline">{formattedDate}</span>
                            {formattedTime && (
                                <span className="text-xs text-muted-foreground">{formattedTime}</span>
                            )}
                        </div>
                    </Link>
                );
            } catch (e) {
                console.error("Error parsing follow-up date:", dateValue, e);
                return <span className="text-muted-foreground">-</span>;
            }
        }
    },

]

