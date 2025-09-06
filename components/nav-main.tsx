"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@radix-ui/react-collapsible";
import {ChevronRight} from "lucide-react";
import {usePathname} from "next/navigation";

export function NavMain({
                            items,
    onCreateAppointment,
                        }: {
    items: {
        title: string
        url?: string
        icon: React.ElementType
        items?: {
            title: string
            url: string
        }[]
    }[],
    onCreateAppointment?: () => void
}) {

    const pathname = usePathname()
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu className="list-none m-0 p-0">
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            onClick={onCreateAppointment}
                            tooltip="Quick Create"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-8"
                        >
                            <IconCirclePlusFilled className="size-5"/>
                            <span>Quick Appointment</span>
                        </SidebarMenuButton>
                        <Button
                            size="icon"
                            className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
                            variant="outline"
                        >
                            <IconMail className="size-5"/>
                            <span className="sr-only">Inbox</span>
                        </Button>
                    </SidebarMenuItem>

                    {items.map((item) => {
                        // 2. Alias the icon component to a capitalized variable to avoid JSX errors.
                        const ItemIcon = item.icon;

                        return item.items ? (
                            // --- RENDER COLLAPSIBLE ITEM ---
                            <Collapsible key={item.title} asChild className="group/collapsible" defaultOpen={item.items.some(subItem => pathname === subItem.url)}>
                                <SidebarMenuItem className={'list-none mb-2'}>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title}>
                                            <ItemIcon className="size-8" />
                                            <span className={'text-lg'}>{item.title}</span>
                                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => {
                                                const isActive = pathname === subItem.url;
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={isActive}>
                                                            <Link href={subItem.url}>
                                                                <span className={'text-lg'}>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ) : (
                            // --- RENDER REGULAR LINK ITEM ---
                            <SidebarMenuItem key={item.title} className={'list-none'}>
                                {(() => {
                                    const isActive = pathname === item.url;
                                    return (
                                        <SidebarMenuButton className={'mb-2'} tooltip={item.title} asChild isActive={isActive}>
                                            <Link href={item.url!}>
                                                <ItemIcon className="size-6" />
                                                <span className={'text-lg'}>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    );
                                })()}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
