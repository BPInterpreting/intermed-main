"use client"

import {LucideIcon} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {usePathname} from "next/navigation";

interface NavItemsProps {
    icon: LucideIcon;
    label: string;
    href: string;

}

export const NavItems = ({
    icon: Icon,
    label,
    href,
}: NavItemsProps) => {
    const pathname = usePathname()
    const active = pathname === href

    return (
        <Button
         asChild
         variant={active ? 'sidebarOutline' : 'sidebar'}
            className='h-[52px] justify-start rounded-2xl'
        >
            <Link href={href}>
                <div className='flex flex-row justify-center items-center gap-x-4'>
                    <Icon size={25} />
                    <p>{label}</p>
                </div>

            </Link>
        </Button>
    )
}