"use client"

import { UserButton } from "@clerk/nextjs";

export function NavUser() {
    return (
        <div className="p-2 flex items-center justify-center">
            {/* This single component handles everything */}
            <UserButton
               appearance={{
                   elements: {
                       userButtonAvatarBox: {
                           width: '42px',
                           height: '42px',
                       },
                   }
               }}
            />
        </div>
    );
}