import {Navbar} from "@/app/(dashboard)/_components/navbar";
import {Sidebar} from "@/app/(dashboard)/_components/sidebar";

export default function DashboardLayout({
                                            children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className='h-full relative'>
                <Navbar />
                <div className='flex flex-col fixed mt-10 bg-blue-600 w-60 inset-y-0 z-80'>
                    <Sidebar />
                    <main className='ml-[70px]'>
                        {children}
                    </main>
                </div>
            </div>
        </>
    )
}