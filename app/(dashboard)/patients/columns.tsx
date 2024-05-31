"use client"

import { ColumnDef } from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";
import {Actions} from "@/app/(dashboard)/patients/actions";

export type ResponseType = InferResponseType<typeof client.api.patients.$get, 200>["data"][0]

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Patient = {
    id: string
    firstName: string
}

export const columns: ColumnDef<ResponseType>[] = [
    // {
    //     accessorKey: "id",
    //     header: "ID",
    // },
    {
        accessorKey: "firstName",
        header: "First Name",
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }

]
