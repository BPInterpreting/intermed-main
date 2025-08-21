import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import {format, parse} from "date-fns";
import {Actions} from "@/app/admin/dashboard/interpreters/[interpreterId]/actions";


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
                <div className={'capitalize'}>
                    {row.original.patient} {row.original.patientLastName}
                </div>
            )
        }

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
        accessorKey: "endTime",
        header: "End Time",
        cell: ({ row }) => {
            const timeString = row.getValue("endTime") as string | null
            if (!timeString) {
                return <span>N/A</span>;
            }
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
        accessorKey: "facility",
        header: "Facility",
        size: 300,
        cell: ({ row }) => {
            return (
                <div className={'capitalize'}>
                    {row.original.facility}
                </div>
            )
        }

    },

]