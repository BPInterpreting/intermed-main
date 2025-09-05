import {Navbar} from "@/app/admin/dashboard/components/navbar";
import {Sidebar} from "@/app/admin/dashboard/components/sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {SiteHeader} from "@/components/site-header";

export default function DashboardLayout({
children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar variant='inset' />
                <SidebarInset>
                    <SiteHeader />
                    <main>
                        {children}
                    </main>
                </SidebarInset>
        </SidebarProvider>
    )
}