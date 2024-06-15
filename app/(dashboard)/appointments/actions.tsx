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
import {useUpdateAppointment} from "@/features/appointments/hooks/use-update-appointment";
import {useDeleteAppointment} from "@/features/appointments/api/use-delete-appointment";

type Props = {
    id: string;
}

export const Actions = ({id}: Props) => {
    const {onOpen} = useUpdateAppointment()
    const deleteMutation = useDeleteAppointment(id)
    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to delete this appointment?',
        "You are about to delete an appointment . This action cannot be undone."
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
                        <DropdownMenuLabel>Details</DropdownMenuLabel>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>

        )

}
