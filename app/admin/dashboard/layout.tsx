import {Navbar} from "@/app/admin/dashboard/components/navbar";
import {Sidebar} from "@/app/admin/dashboard/components/sidebar";

export default function DashboardLayout({
children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div>
                <Navbar/>
            </div>
            <div>
                <Sidebar className='hidden md:flex '/>
            </div>
            <main className='md:pl-60 h-full pt-[80px]  mt-5'>
                <div className='h-full'>
                    {children}
                </div>

            </main>
        </>
    )
}