"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Appointment = {
    id: string
    firstName: string
}

export const columns: ColumnDef<Appointment>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "firstName",
        header: "First Name",
    },
]
