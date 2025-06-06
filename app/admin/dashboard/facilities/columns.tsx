"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from "@/app/admin/dashboard/facilities/actions";
import {formatPhoneNumber, trimAddress} from "@/lib/utils";


// This is a type definition for the data that will be returned from the API part of the github v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.facilities.$get, 200>['data'][0]

export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return(
                <Actions id={row.original.id} />
            )
        }
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <div className="capitalize">
                    {row.original.name}
                </div>
            )
        }
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => {
            const trimmedAddress = trimAddress(row.original.address)
            return (
                <div>
                    {trimmedAddress}
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
                    {formatPhoneNumber(row.original.phoneNumber ?? "")}
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


]
