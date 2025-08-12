"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Actions } from "@/app/admin/dashboard/patients/actions";
import { formatPhoneNumber } from "@/lib/utils";
import {patient} from "@/db/schema";
import {format} from "date-fns";
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";

export type ResponseType = InferResponseType<typeof client.api.patients.$get, 200>["data"][0]

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) =>{
            return(
                <Actions id={row.original.id} />
            )
        }
    },
    {
        accessorKey: 'patientId',
        header: 'Patient ID',
        cell: ({ row }) =>{
            return(
                <div>
                    {row.original.patientId}
                </div>
            )
        }
    },
    {
        id: "fullName",
        header: "Name",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => {
            return (
                <div className='capitalize'>
                    {row.original.firstName} {row.original.lastName}
                </div>
            )
        },
        filterFn: (row, id, value) => {
            const firstName = (row.original.firstName || '').toLowerCase();
            const lastName = (row.original.lastName || '').toLowerCase();
            const searchValue = value.toLowerCase();

            // Split search into individual words (keeping spaces intact in original data)
            const searchWords = searchValue.trim().split(/\s+/).filter((word: string) => word.length > 0);

            // Each search word must match somewhere in first or last name
            return searchWords.every((word: string) =>
                firstName.includes(word) || lastName.includes(word)
            );
        }
    },
    {
        accessorKey: "dateOfBirth",
        header: 'DOB',
        size: 200,
        cell: ({ row }) => {
            const date = row.getValue("dateOfBirth") as Date | null

            if (!date) {
                return <span className="text-muted-foreground">Not provided</span>
            }

            return(
                <span>
                {format(date, "PPP")} {/* Also simplified the format */}
            </span>
            )
        }
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        cell: ({ row }) => {

            return (
                <div>
                    {formatPhoneNumber(row.original.phoneNumber)}
                </div>
            )
        }
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            return <div>{row.original.email}</div>
        }
    },
    {
        accessorKey: "insuranceCarrier",
        header: "Insurance Carrier",
        cell: ({ row }) => {
            return <div className='capitalize'>{row.original.insuranceCarrier}</div>
        }
    },
    {
        accessorKey: "preferredLanguage",
        header: "Preferred Language",
        cell: ({ row }) => {
            return <div>{row.original.preferredLanguage}</div>
        }
    },


]
