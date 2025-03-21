"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from "@/app/admin/(dashboard)/facilities/actions";
import {formatPhoneNumber} from "@/lib/utils";


// This is a type definition for the data that will be returned from the API part of the github v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.facilities.$get, 200>['data'][0]


export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "address",
        header: "Address",
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
        accessorKey: "facilityType",
        header: "Facility Type",
    },
    {
        accessorKey: "operatingHours",
        header: "Operating Hours",
    },
    {
        accessorKey: "averageWaitTime",
        header: "Average Wait Time",
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }

]
