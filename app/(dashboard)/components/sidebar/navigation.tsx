"use client"

import {usePathname} from "next/navigation";
import {
    ClipboardPlusIcon,
    LayoutGridIcon,
    LucideBriefcase,
    NotebookText,
    UsersIcon
} from "lucide-react";
import { FaRegHospital } from "react-icons/fa6"
import {NavItems} from "@/app/(dashboard)/components/sidebar/nav-items";
import {map} from "zod";
import {Separator} from "@/components/ui/separator";
import {ModeToggle} from "@/components/theme/mode-toggle";
import Image from 'next/image'

export const Navigation = () => {
    // this is the hook that is used to read the pathname. if the pathname mathces the route it will be true


    // routes are the array of objects that are used to create the navigation links
     const routes = [
         {
             label: "Home",
             href: `/home`,
             icon: LayoutGridIcon
         },
        {
            label: "Appointments ",
            href: `/appointments`,
            icon: NotebookText
        },
         {
             label: "Patients ",
             href: `/patients`,
             icon: UsersIcon
         },
         {
             label: "Facilities ",
             href: `/facilities`,
             icon: ClipboardPlusIcon
         },

     ]

  return (
      <>
          <div>
              <div className='flex items-center justify-center pt-8 pl-4 pb-7'>
                  <Image src='/logo.svg' alt='logo' height={100} width={100} />
              </div>
              <Separator/>
              <ul className='flex flex-col gap-y-2 flex-1 pt-10 m-2'>
                  {routes.map((route) => (
                      <NavItems
                          key={route.href}
                          {...route}
                      />
                  ))}
              </ul>
          </div>

      </>


  )
}

export default Navigation;