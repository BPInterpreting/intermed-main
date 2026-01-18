"use client"

import * as React from "react"
import Image from "next/image"
import {
    IconCamera,
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
    IconCalendar,
    IconClipboardHeart,
    IconBuildingHospital
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {TbBuildingHospital} from "react-icons/tb";
import {useNewAppointment} from "@/features/appointments/hooks/use-new-appointments";
import {Collapsible} from "@radix-ui/react-collapsible";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/admin/dashboard/home",
            icon: IconDashboard,
        },
        {
            title: "Appointments",
            // url: "/admin/dashboard/appointments",
            icon: IconCalendar,
            items: [
                {
                    title: 'History',
                    url: "/admin/dashboard/appointments",
                },
                {
                    title: 'Offers',
                    url: "/admin/dashboard/offers",
                }
            ]
        },
        {
            title: "Facilities",
            url: "/admin/dashboard/facilities",
            icon: IconBuildingHospital,
        },
        {
            title: "Patients",
            url: "/admin/dashboard/patients",
            icon: IconClipboardHeart,
        },
        {
            title: "Interpreters",
            url: "/admin/dashboard/interpreters",
            icon: IconUsers,
        },
    ],
    navClouds: [
        {
            title: "Capture",
            icon: IconCamera,
            isActive: true,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Proposal",
            icon: IconFileDescription,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Prompts",
            icon: IconFileAi,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: IconSettings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: IconHelp,
        },
        {
            title: "Search",
            url: "#",
            icon: IconSearch,
        },
    ],
    documents: [
        {
            name: "Data Library",
            url: "#",
            icon: IconDatabase,
        },
        {
            name: "Reports",
            url: "#",
            icon: IconReport,
        },
        {
            name: "Word Assistant",
            url: "#",
            icon: IconFileWord,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const newAppointment = useNewAppointment()

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            className="data-[slot=sidebar-menu-button]:!p-1.5 h-16 overflow-visible"
                        >
                            <a href="/admin/dashboard/home" className="flex items-center justify-start w-full">
                                <div className="relative h-16 w-96">
                                    <Image
                                        src="/branding/Transparent Logo.png"
                                        alt="InterpreFi"
                                        fill
                                        className="object-contain object-left"
                                        sizes="384px"
                                    />
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain
                    items={data.navMain}
                    onCreateAppointment={newAppointment.onOpen}
                />
                {/*<NavDocuments items={data.documents} />*/}
                {/*<NavSecondary items={data.navSecondary} className="mt-auto" />*/}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
