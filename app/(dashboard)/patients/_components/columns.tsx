"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type PatientsColumn = {
    id: string
    firstName: string
}

export const columns: ColumnDef<PatientsColumn>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "firstName",
        header: "First Name",
    },

]
