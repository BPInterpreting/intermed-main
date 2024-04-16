import {UserButton} from "@clerk/nextjs";

export const Navbar = () => {
    return (
        <div className='bg-red-600'>
               <h1>Navbar</h1>
            <UserButton
                afterSignOutUrl='/'
                showName
            />
        </div>

    )
}