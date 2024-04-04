import {UserButton} from "@clerk/nextjs";

export const Navbar = () => {
    return (
        <div>
               <h1>Navbar</h1>
            <UserButton
                afterSignOutUrl='/'
                showName
            />
        </div>

    )
}