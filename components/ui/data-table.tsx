"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable, getFacetedRowModel, getFacetedUniqueValues,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Button} from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import {Trash} from "lucide-react";
import {DataTableToolbar, SupportedFilters} from "@/components/ui/data-table-toolbar";
import {format} from "date-fns";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    enabledFilters?: SupportedFilters[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
    enabledFilters

}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState('')

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) =>{

            console.log({ row, columnId, filterValue });
            const search = filterValue.toLowerCase().trim();

            if (!search) return true

            const original = row.original as any; // Type assertion to avoid TS errors

            const firstName = original.firstName?.toLowerCase() || '';
            const lastName = original.lastName?.toLowerCase() || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const phoneNumber = row.getValue('phoneNumber')?.toString() || ''
            const dateOfBirth = row.getValue("dateOfBirth")

            const searchWords = search.split(/\s+/).filter((word: string) => word.length > 0);

            // For single word search or phone/date search
            if (searchWords.length === 1) {
                const singleSearch = searchWords[0];

                // Name search - check if the search term appears in any part
                if (firstName.includes(singleSearch) ||
                    lastName.includes(singleSearch) ||
                    fullName.includes(singleSearch)) {
                    return true;
                }

                // Phone search
                const cleanPhone = phoneNumber.replace(/\D/g, '');
                const searchPhone = singleSearch.replace(/\D/g, '');
                if (searchPhone && cleanPhone.includes(searchPhone)) {
                    return true;
                }

                // Date search
                if (dateOfBirth) {
                    try {
                        let date: Date;

                        if (dateOfBirth instanceof Date) {
                            date = dateOfBirth;
                        } else if (typeof dateOfBirth === 'string' || typeof dateOfBirth === 'number') {
                            date = new Date(dateOfBirth);
                        } else {
                            return false;
                        }

                        if (isNaN(date.getTime())) {
                            return false;
                        }

                        const formatted1 = format(date, "MM/dd/yyyy").toLowerCase();
                        const formatted2 = format(date, "M/d/yyyy").toLowerCase();
                        const formatted3 = format(date, "yyyy-MM-dd").toLowerCase();

                        if (formatted1.includes(singleSearch) ||
                            formatted2.includes(singleSearch) ||
                            formatted3.includes(singleSearch)) {
                            return true;
                        }
                    } catch (e) {
                        // Continue if date parsing fails
                    }
                }
            } else {
                // Multiple words - check if ALL words appear in the name
                // This matches your custom filterFn logic
                const allWordsMatch = searchWords.every((word: string) =>
                    firstName.includes(word) || lastName.includes(word)
                );

                if (allWordsMatch) {
                    return true;
                }
            }
            return false
        },
        state: {
            sorting,
            columnFilters,
            rowSelection,
            globalFilter,
        },
    })

    return (
        <div className='space-y-4'>
            <DataTableToolbar table={table} enabledFilters={enabledFilters} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                minWidth: header.column.columnDef.size,
                                                maxWidth: header.column.columnDef.size,
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{
                                                minWidth: cell.column.columnDef.size,
                                                maxWidth: cell.column.columnDef.size,
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
