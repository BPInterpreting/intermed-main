"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Actions } from "@/app/(dashboard)/patients/actions";
import { formatPhoneNumber } from "@/lib/utils";

export type ResponseType = InferResponseType<typeof client.api.patients.$get, 200>["data"][0]

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "firstName",
        header: "Name",
        cell: ({ row }) => {
            return (
                <div>
                    {row.original.firstName} {row.original.lastName}
                </div>
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
            return <div>{row.original.insuranceCarrier}</div>
        }
    },
    {
        accessorKey: "preferredLanguage",
        header: "Preferred Language",
        cell: ({ row }) => {
            return <div>{row.original.preferredLanguage}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }

]
