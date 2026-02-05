"use client"

import {
    IconBuildingHospital,
    IconCalendar,
    IconCamera,
    IconClipboardHeart,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconHelp,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers
} from "@tabler/icons-react"
import Image from "next/image"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
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
import { useNewAppointment } from "@/features/appointments/hooks/use-new-appointments"
import { FaFileInvoiceDollar } from "react-icons/fa6"

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
        {
            title: "Billing",
            // url: "/admin/dashboard/appointments",
            icon: FaFileInvoiceDollar,
            items: [
                {
                    title: 'Overview',
                    url: "/admin/dashboard/billing",
                },
                {
                    title: 'Payers',
                    url: "/admin/dashboard/payers",
                },
                {
                    title: 'Invoices',
                    url: "/admin/dashboard/invoices",
                },
                {
                    title: 'Payouts',
                    url: "/admin/dashboard/payouts",
                },
            ]
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
