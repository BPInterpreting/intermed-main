'use client'

import { Eye, MoreHorizontal, CheckCircle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMarkPayoutPaidDialog } from "@/features/payouts/hooks/use-mark-payout-paid-dialog";
import Link from "next/link";

type Props = {
    id: string;
    status: string;
}

export const Actions = ({ id, status }: Props) => {
    const markPaidDialog = useMarkPayoutPaidDialog()

    const canMarkPaid = status === "pending"
    const isPaid = status === "paid"

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/dashboard/payouts/${id}`} className="flex items-center">
                            <Eye className="size-4 mr-2" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    {!isPaid && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a href={`/api/payouts/${id}/export`} className="flex items-center" download>
                                    <FileDown className="size-4 mr-2" />
                                    Export CSV
                                </a>
                            </DropdownMenuItem>
                        </>
                    )}
                    {canMarkPaid && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => markPaidDialog.onOpen(id)}>
                                <CheckCircle className="size-4 mr-2" />
                                Mark as Paid
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}