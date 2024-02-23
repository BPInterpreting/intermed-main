import {Navbar} from "@/app/(dashboard)/_components/navbar";
import {UserButton} from "@clerk/nextjs";

export default function DashboardLayout({
                                            children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navbar />
            <div className='flex h-full pt-20'>
                {children}
            </div>
        </>
    )
}