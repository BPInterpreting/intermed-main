'use client'

import {Edit, MoreHorizontal, Trash} from "lucide-react";
import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useConfirm} from "@/hooks/use-confirm";
import {useUpdateFacility} from "@/features/facilities/hooks/use-update-facility";
import {useDeleteFacility} from "@/features/facilities/api/use-delete-facility";

type Props = {
    id: string;
}

export const Actions = ({id}: Props) => {
    const {onOpen} = useUpdateFacility()
    const deleteMutation = useDeleteFacility(id)
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
                <DropdownMenu modal={false}>
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
                        <DropdownMenuLabel>Details</DropdownMenuLabel>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>

        )

}
