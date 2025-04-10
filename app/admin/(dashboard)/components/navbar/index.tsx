'use client'

import {UserButton} from "@clerk/nextjs";
import {ModeToggle} from "@/components/theme/mode-toggle";
import {Input} from "@/components/ui/input";
import {Search} from "./search";


export const Navbar = () => {
    return (
        <nav className='fixed top-0 h-[87px] pl-60  w-full px-4 z-10 bg-secondary rounded-b-md '>
            <div className='flex  items-center justify-between p-4'>
                <div>
                    <UserButton
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
                    {/*<Search />*/}
                    {/*<ModeToggle/>*/}
            </div>
        </nav>

    )
}