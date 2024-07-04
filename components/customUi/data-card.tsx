import {LucideIcon} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


interface DataCardProps {
    icon: LucideIcon
    title: string

}

export const DataCard = ({
    icon: Icon,
    title
}: DataCardProps) => {
    return(
        <Card>
            <CardHeader className='flex flex-row items-center justify-between gap-x-4'>
                <CardTitle className='text-md font-bold'>
                    {title}
                </CardTitle>
                    <Icon size={20} />
            </CardHeader>
            <CardContent>
            </CardContent>
        </Card>
    )
}