'use client'

import { Edit, Eye, MoreHorizontal, Trash, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConfirm } from "@/hooks/use-confirm";
import { useDeletePayer } from "@/features/payers/api/use-delete-payer";
import { useUpdatePayer } from "@/features/payers/api/use-update-payer";
import { useOpenPayer } from "@/features/payers/hooks/use-open-payer";
import Link from "next/link";

type Props = {
    id: string;
    isActive: boolean;
}

export const Actions = ({ id, isActive }: Props) => {
    const { onOpen } = useOpenPayer()
    const deleteMutation = useDeletePayer(id)
    const updateMutation = useUpdatePayer(id)

    const [DeactivateDialog, confirmDeactivate] = useConfirm(
        'Are you sure you want to deactivate this payer?',
        "This will mark the payer as inactive. You can reactivate them later."
    )

    const [ReactivateDialog, confirmReactivate] = useConfirm(
        'Reactivate this payer?',
        "This will mark the payer as active again."
    )

    const handleDeactivate = async () => {
        const ok = await confirmDeactivate()
        if (ok) {
            deleteMutation.mutate()
        }
    }

    const handleReactivate = async () => {
        const ok = await confirmReactivate()
        if (ok) {
            updateMutation.mutate({ isActive: true })
        }
    }

    const isPending = deleteMutation.isPending || updateMutation.isPending

    return (
        <>
            <DeactivateDialog />
            <ReactivateDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        disabled={isPending}
                        onClick={() => onOpen(id)}
                    >
                        <Edit className="size-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    {isActive ? (
                        <DropdownMenuItem
                            disabled={isPending}
                            onClick={handleDeactivate}
                        >
                            <Trash className="size-4 mr-2" />
                            Deactivate
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            disabled={isPending}
                            onClick={handleReactivate}
                        >
                            <RotateCcw className="size-4 mr-2" />
                            Reactivate
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Link href={`/admin/dashboard/payers/${id}`} className="flex items-center">
                            <Eye className="size-4 mr-2" />
                            Details
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}