"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "./button"
import { Input } from "./input"
import { DataTableViewOptions } from "./data-table-view-options"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import {useGetAppointments} from "@/features/appointments/api/use-get-appointments";
import {useMemo} from "react";

export type SupportedFilters = 'patient' | 'name' | 'firstName' | 'status' | 'interpreter' | 'lastName' | 'fullName'

interface AppointmentData {
    interpreterFirstName?: string;
    interpreterLastName?: string;
    // Add any other fields from your appointment data if needed
}

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    enabledFilters?: SupportedFilters[]
}

export function DataTableToolbar<TData>({
    table,
    enabledFilters = []
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

    const interpreterOptions = useMemo(() => {
        if (!appointment) return [];

        const interpreterNames = new Set<string>();
        // We cast to AppointmentData[] to safely access the name properties
        (appointment as AppointmentData[]).forEach(appt => {
            const firstName = appt.interpreterFirstName || '';
            const lastName = appt.interpreterLastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            if (fullName) {
                interpreterNames.add(fullName);
            }
        });

        return Array.from(interpreterNames).sort().map(name => ({
            label: name,
            value: name
        }));
    }, [appointment]);


    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {enabledFilters?.includes('patient') && table.getColumn("patient") && (
                    <Input
                        placeholder="Filter Patient..."
                        value={(table.getColumn("patient")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("patient")?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {enabledFilters?.includes('name') && table.getColumn("name") && (
                        <Input
                            placeholder="Filter Name..."
                            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("name")?.setFilterValue(event.target.value)
                            }
                            className="h-8 w-[150px] lg:w-[250px]"
                        />
                    )
                }
                {enabledFilters?.includes('fullName') && table.getColumn("fullName") && (
                    <Input
                        placeholder="Filter Full name..."
                        value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("fullName")?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {enabledFilters?.includes('firstName') && table.getColumn("firstName") && (
                        <Input
                            placeholder="Filter First Name..."
                            value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("firstName")?.setFilterValue(event.target.value)
                            }
                            className="h-8 w-[150px] lg:w-[250px]"
                        />
                    )
                }
                {enabledFilters?.includes('lastName') && table.getColumn("lastName") && (
                    <Input
                        placeholder="Filter Last Name..."
                        value={(table.getColumn("lastName")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("lastName")?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {/* --- THIS IS THE NEW INTERPRETER FILTER --- */}
                {enabledFilters?.includes('interpreter') && table.getColumn("interpreter") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("interpreter")}
                        title="Interpreter"
                        options={interpreterOptions}
                    />
                )}
                {enabledFilters?.includes('status') && table.getColumn("status") && (
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