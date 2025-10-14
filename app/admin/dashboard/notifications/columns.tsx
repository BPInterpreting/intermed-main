"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMarkNotificationsAsRead } from "@/features/notifications/use-mark-notifications-as-read";
import {Actions} from "@/app/admin/dashboard/notifications/actions";

export type ResponseType = InferResponseType<typeof client.api.notifications.$get, 200>["data"][0];

export const columns: ColumnDef<ResponseType>[] = [
    {
        id: 'status',
        header: '',
        // This cell now renders the simple dot for "Unread" notifications
        cell: ({ row }) => {
            const isRead = row.original.isRead;
            return (
                <div className="flex items-center justify-center">
                    {!isRead && (
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500" title="Unread" />
                    )}
                </div>
            )
        },
        size: 15, // A smaller size for the status column
    },
    {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ row }) => {
            const notification = row.original

            return(
                <div>
                    <p>{notification.message}</p>
                    {notification.subtext && (
                        <p className="text-xs text-gray-500 mt-1">
                            {notification.subtext}
                        </p>
                    )}
                </div>

            )
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Notification Date',
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <span>{format(date, "PPP p")}</span>;
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        // This correctly passes the entire notification object to the Actions component
        cell: ({ row }) => <Actions notification={row.original} />,
    },
];

