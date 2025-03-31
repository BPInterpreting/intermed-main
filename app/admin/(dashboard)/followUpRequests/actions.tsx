'use client'

import {Edit, MoreHorizontal} from "lucide-react";
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useUpdatePatient} from "@/features/patients/hooks/use-update-patient";
import {useDeletePatient} from "@/features/patients/api/use-delete-patient";
import {useConfirm} from "@/hooks/use-confirm";

import { Trash} from "lucide-react";
import {useUpdateFollowUpRequest} from "@/features/followUpRequests/hooks/use-update-follow-up-request";
import {useDeleteFollowUpRequest} from "@/features/followUpRequests/api/use-delete-follow-up-request";

type Props = {
    id: string;
}

export const Actions = ({id}: Props) => {
    const {onOpen} = useUpdateFollowUpRequest()
    const deleteMutation = useDeleteFollowUpRequest(id)
    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to delete this patient?',
        "You are about to delete a patient. This action cannot be undone."
    )

    const handleDelete = async () => {
        const ok = await confirm()

        if(ok) {
            deleteMutation.mutate()
        }
    }

        return (
            <>
                <ConfirmDialog/>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            disabled={deleteMutation.isPending}
                            onClick={() => onOpen(id)}
                        >
                            <Edit className="size-4 mr-2"/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            disabled={deleteMutation.isPending}
                            onClick={handleDelete}
                        >
                            <Trash className="size-4 mr-2"/>
                            Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuLabel>Delete</DropdownMenuLabel>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>

        )

}
