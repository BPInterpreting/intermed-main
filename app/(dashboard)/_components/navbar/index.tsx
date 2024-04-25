import {UserButton} from "@clerk/nextjs";

export const Navbar = () => {
    return (
        <nav className='fixed w-full bg-red-600 z-10 shadow-sm py-4 px-2 border-b-[1px] pt-1 pb-1'>
            <div className='items-center flex justify-between'>
                <h1>InterMed Technologies</h1>
                <UserButton
                    afterSignOutUrl='/'
                    showName
                />
            </div>

        </nav>

    )
}