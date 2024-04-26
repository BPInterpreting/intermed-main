import {UserButton} from "@clerk/nextjs";
import {ModeToggle} from "@/components/theme/mode-toggle";

export const Navbar = () => {
    return (
        <nav className='fixed top-0 h-[100px] pl-60  w-full px-4 z-10 shadow-sm border-b-[1px] pt-1 pb-1'>
            <div className='flex items-center justify-between'>
                <h1>User</h1>
                <div>
                    <UserButton
                        afterSignOutUrl='/'
                        showName
                    />
                </div>
                <div className='justify-center'>
                    Search
                </div>
                <div className='flex justify-end'>
                    <ModeToggle/>
                </div>

            </div>
        </nav>

    )
}