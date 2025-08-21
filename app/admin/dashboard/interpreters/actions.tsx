'use client'

import {Edit, Eye, MoreHorizontal, Trash} from "lucide-react";
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
import {useUpdateInterpreter} from "@/features/interpreters/hooks/use-update-interpreter";
import {useDeleteInterpreter} from "@/features/interpreters/api/use-delete-interpreter";
import {useRouter} from "next/navigation";
import Link from "next/link";

type Props = {
    id: string;
}

export const Actions = ({id}: Props) => {
    const {onOpen} = useUpdateInterpreter()
    const router = useRouter()
    const deleteMutation = useDeleteInterpreter(id)
    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure you want to delete this Interpreter?',
        "You are about to delete an interpreter. This action cannot be undone."
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
                        <DropdownMenuItem
                            asChild
                            disabled={deleteMutation.isPending}
                        >
                            <Link href={`/admin/dashboard/interpreters/${id}`} className="flex items-center">
                                <Eye className="size-4 mr-2"/>
                                Details
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>

        )

}
