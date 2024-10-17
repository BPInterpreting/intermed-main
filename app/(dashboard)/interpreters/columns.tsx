"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from "@/app/(dashboard)/interpreters/actions";

import {formatPhoneNumber} from "@/lib/utils";


// This is a type definition for the data that will be returned from the API part of the github v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.interpreters.$get, 200>['data'][0]


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
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            return <div>{row.original.email}</div>
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
        accessorKey: "targetLanguage",
        header: "Target Languages",
        cell: ({ row }) => {
            return <div>{row.original.targetLanguages}</div>
        }
    },
    {
        accessorKey: 'isCertified',
        header: 'isCertified',
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }

]
