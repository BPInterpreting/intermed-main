'use client'

import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {ColumnDef} from "@tanstack/react-table";

import Clock from "react-clock";
import {Badge} from "@/components/ui/badge";
import {format, parseISO} from "date-fns";
import {CheckCircle, Eye, Star, XCircle} from "lucide-react";
import {cn} from "@/lib/utils";

export type ResponseType = InferResponseType<typeof client.api.appointments.offers.monitoring.$get, 200>["data"][0]

export const columns: ColumnDef<any>[] = [
    {
        id: "name",
        header: "Interpreter",
        cell: ({ row }) => {
            const firstName = row.original.firstName;
            const lastName = row.original.lastName;
            const isAccepted = row.original.response === "accepted"
            return (
                <div className={cn(
                    "font-medium flex items-center gap-2",
                    isAccepted && "text-green-700 font-semibold"
                )}>
                    {isAccepted && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    {firstName} {lastName}
                </div>
            );
        }
    },
    {
        accessorKey: 'response',
        header: 'Response',
        cell: ({ row }) => {
            const response = row.getValue('response') as string

            if (!response) {
                return (
                    <Badge variant="outline" >
                        Pending
                    </Badge>
                );
            }

            switch (response.toLowerCase()) {
                case "accepted":
                    return (
                        <Badge variant="confirmed" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Accepted
                        </Badge>
                    );
                case "decline":
                case "declined":
                    return (
                        <Badge variant="cancelled" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Declined
                        </Badge>
                    );
                default:
                    return (
                        <Badge variant="outline">
                            {response}
                        </Badge>
                    );
            }
        }
    },
    {
        accessorKey: "viewedAt",
        header: "Viewed",
        cell: ({ row }) => {
            const viewedAt = row.getValue("viewedAt") as string | null;

            if (!viewedAt) {
                return (
                    <span className="text-muted-foreground text-sm">
                        Not viewed
                    </span>
                );
            }

            return (
                <Badge variant={'confirmed'}>
                    <Eye className="h-3 w-3 text-green-600" />
                    <span className={'ml-1'}>
                        {format(parseISO(viewedAt), "MMM d, h:mm a")}
                    </span>
                </Badge>
            );
        }
    },
    {
        accessorKey: "respondedAt",
        header: "Responded",
        cell: ({ row }) => {
            const respondedAt = row.getValue("respondedAt") as string | null;
            const response = row.original.response;

            // Only show responded time if they actually responded (accepted/declined)
            if (!respondedAt || !response) {
                return (
                    <span className="text-muted-foreground text-sm">
                        —
                    </span>
                );
            }

            return (
                <span className="text-sm">
                    {format(parseISO(respondedAt), "MMM d, h:mm a")}
                </span>
            );
        }
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const response = row.original.response;
            const viewedAt = row.original.viewedAt;
            const respondedAt = row.original.respondedAt;

            // Determine the current status
            if (response === "accepted") {
                return (
                    <Badge variant="confirmed">
                        Accepted
                    </Badge>
                );
            } else if (response === "decline" || response === "declined") {
                return (
                    <Badge variant="cancelled">
                        Declined
                    </Badge>
                );
            } else if (viewedAt) {
                return (
                    <Badge variant="pendingConfirmation">
                        Viewed
                    </Badge>
                );
            } else {
                return (
                    <Badge variant="interpreterRequested">
                        Notified
                    </Badge>
                );
            }
        }
    },
    {
        accessorKey: "distanceMiles",
        header: "Distance",
        cell: ({ row }) => {
            const distance = row.getValue("distanceMiles") as string | null;

            if (!distance) {
                return (
                    <span className="text-muted-foreground text-sm"> - </span>
                )
            }

            const distanceMiles = parseFloat(distance);

            return (
                <span className="text-sm">{distanceMiles.toFixed(1)} Miles</span>
            )
        }
    }

]
