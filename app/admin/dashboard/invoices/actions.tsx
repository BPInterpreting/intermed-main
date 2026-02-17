'use client'

import { Edit, Eye, MoreHorizontal, Trash, Send, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConfirm } from "@/hooks/use-confirm"
import { useDeleteInvoice } from "@/features/invoices/api/use-delete-invoice" 
import Link from "next/link"

type Props = {
    id: string
}

export const Actions = ({ id }: Props) => {
    const deleteMutation = useDeleteInvoice(id)
    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure you want to delete this invoice?",
        "You are about to delete an invoice. This action cannot be undone."
    )

    const handleDelete = async () => {
        const ok = await confirm()
        if (ok) {
            deleteMutation.mutate()
        }
    }

    return (
        <>
            <ConfirmDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem disabled={deleteMutation.isPending}>
                        <Link href={`/admin/dashboard/invoices/${id}`} className="flex items-center w-full">
                            <Eye className="size-4 mr-2" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        disabled={deleteMutation.isPending}
                        onClick={handleDelete}
                    >
                        <Trash className="size-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}