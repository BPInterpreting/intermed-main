"use client"

import {LucideIcon} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {ChevronDownCircleIcon, ChevronUpCircleIcon, ChevronDown, ChevronUp} from "lucide-react";

interface SubItems {
    label: string;
    href: string;
}

interface NavItemsProps {
    icon: LucideIcon;
    label: string;
    href: string;
    subItems?: SubItems[];
}

export const NavItems = ({
    icon: Icon,
    label,
    href,
   subItems
}: NavItemsProps) => {
    const pathname = usePathname()
    const active = pathname === href
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)

    const toggleSubMenu = () => {
        setIsSubMenuOpen(!isSubMenuOpen)
    }

    return (
        <>
            <Button
                asChild
                variant={active ? 'sidebarOutline' : 'sidebar'}
                className='h-[52px] justify-start rounded-2xl'
                onClick={toggleSubMenu}
            >
                <Link href={href}>
                    <div className='flex flex-row items-center gap-x-4'>
                        <Icon size={25} />
                        <p>{label}</p>
                        {subItems && (
                            <span >{ isSubMenuOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} /> }</span>
                        )}
                    </div>
                </Link>
            </Button>
            {subItems && isSubMenuOpen && (
                <ul className='ml-8 mt-2'>
                    {subItems?.map((subItem) => (
                        <li key={subItem.label} className='pl-8'>
                            <Link href={subItem.href}>
                                <p className='text-sm'>{subItem.label}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )

}