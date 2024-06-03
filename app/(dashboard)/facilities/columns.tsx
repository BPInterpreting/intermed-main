"use client"

import {ColumnDef} from "@tanstack/react-table"
import {InferResponseType} from "hono";
import {client} from "@/lib/hono";

// This is a type definition for the data that will be returned from the API part of the github v4.3 doc
export type ResponseType = InferResponseType<typeof client.api.facilities.$get, 200>['data'][0]


export const columns: ColumnDef<ResponseType>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },

]
