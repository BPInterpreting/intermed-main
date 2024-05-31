import {MoreHorizontal} from "lucide-react";
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

type Props = {
    id: string;
}

export const Actions = ({id}: Props) => {
    const {onOpen} = useUpdatePatient()

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => onOpen(id)}
                    >
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuLabel>Delete</DropdownMenuLabel>
                </DropdownMenuContent>
            </DropdownMenu>
        )

}
