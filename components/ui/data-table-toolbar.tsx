"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "./button"
import { Input } from "./input"
import { DataTableViewOptions } from "./data-table-view-options"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";

interface DataTableToolbarProps<TData> {
    table: Table<TData>
}

export function DataTableToolbar<TData>({
                                            table,
                                        }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    const {data: appointment} = useGetAppointments()

    const statuses = appointment ? appointment.map(appt => appt.status) : [];
// Filter out any null values
    const uniqueStatuses = Array.from(new Set(statuses.filter((s): s is string => s !== null)));
    const statusOptions = uniqueStatuses.map(status => ({
        label: status,
        value: status,
    }));



    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter Patient..."
                    value={(table.getColumn("patient")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("patient")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("status") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("status")}
                        title="Status"
                        options={statusOptions}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    )
}