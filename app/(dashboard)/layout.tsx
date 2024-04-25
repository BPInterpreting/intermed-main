import {Navbar} from "@/app/(dashboard)/_components/navbar";
import {Sidebar} from "@/app/(dashboard)/_components/sidebar";

export default function DashboardLayout({
                                            children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Sidebar className='hidden md:flex '/>
            <main className='md:ml-60 h-full pt-[50px] md:pt-0'>
                    <div className='h-full bg-blue-900'>
                        {children}
                    </div>

            </main>
    </>
)
}