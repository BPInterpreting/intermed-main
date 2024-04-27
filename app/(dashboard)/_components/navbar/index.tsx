'use client'

import {UserButton} from "@clerk/nextjs";
import {ModeToggle} from "@/components/theme/mode-toggle";
import {Input} from "@/components/ui/input";
import { Search } from 'lucide-react';


export const Navbar = () => {
    return (
        <nav className='fixed top-0 h-[100px] pl-60  w-full px-4 z-10 shadow-sm border-b-[1px]'>
            <div className='flex flex-row items-center justify-between p-2'>
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
                <div className='flex flex-row items-center justify-center'>
                    <Input
                        placeholder='Search...'
                    />
                </div>
                <div className='flex justify-end'>
                    <ModeToggle/>
                </div>

            </div>
        </nav>

    )
}