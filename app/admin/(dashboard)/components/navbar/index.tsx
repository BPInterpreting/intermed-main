'use client'

import {UserButton} from "@clerk/nextjs";
import {ModeToggle} from "@/components/theme/mode-toggle";
import {Input} from "@/components/ui/input";
import {Search} from "./search";


export const Navbar = () => {
    return (
        <nav className='fixed top-0 h-[85px] pl-60  w-full px-4 z-10 '>
            <div className='flex  items-center justify-between p-2'>
                <div>
                    <UserButton
                        afterSignOutUrl='/'
                        showName
                        appearance={{

                            elements: {
                                userButtonBox : {
                                    flexDirection: 'row-reverse',
                                },
                                userButtonAvatarBox: {
                                    width: '60px',
                                    height: '60px',
                                },
                                userButtonOuterIdentifier: {
                                    fontSize: '30px',
                                    fontWeight: 'bold',
                                },
                                userButtonPopoverCard:{
                                    width: '300px',
                                    marginLeft: '150px'
                                },

                            },
                            // variables: {
                            //     fontSize: '20px',
                            // }
                        }}
                    />
                </div>
                    <Search />
                    <ModeToggle/>
            </div>
        </nav>

    )
}