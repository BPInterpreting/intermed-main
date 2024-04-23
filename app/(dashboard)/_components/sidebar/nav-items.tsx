"use client"

import {LucideIcon} from "lucide-react";
import Link from "next/link";

interface NavItemsProps {
    icon: LucideIcon;
    label: string;
    href: string;
    isActive: boolean;
}

export const NavItems = ({
    icon: Icon,
    label,
    href,
    isActive
}: NavItemsProps) => {
    return (
        <Link href={href}>
            <Icon size={25} />
            <p>{label}</p>
        </Link>
    )
}