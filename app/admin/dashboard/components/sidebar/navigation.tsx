"use client"

import {usePathname} from "next/navigation";
import {
    BriefcaseIcon,
    ClipboardPlusIcon,
    LayoutGridIcon,
    LucideBriefcase,
    NotebookText,
    UsersIcon
} from "lucide-react";
import { FaRegHospital } from "react-icons/fa6"
import {NavItems} from "@/app/admin/dashboard/components/sidebar/nav-items";
import {map} from "zod";
import {Separator} from "@/components/ui/separator";
import {ModeToggle} from "@/components/theme/mode-toggle";
import Image from 'next/image'
import {FcBusinessman} from "react-icons/fc";
import {BiBriefcase, BiSolidBriefcaseAlt} from "react-icons/bi";
import {useState} from "react";

export const Navigation = () => {
    // this is the hook that is used to read the pathname. if the pathname mathces the route it will be true

    // routes are the array of objects that are used to create the navigation links
     const routes = [
         {
             label: "Home",
             href: `/admin/dashboard/home`,
             icon: LayoutGridIcon
         },
        {
            label: "Appointments ",
            href: `/admin/dashboard/appointments`,
            icon: NotebookText,
        },
         {
             label: "Patients ",
             href: `/admin/dashboard/patients`,
             icon: UsersIcon
         },
         {
             label: "Facilities ",
             href: `/admin/dashboard/facilities`,
             icon: ClipboardPlusIcon
         },
         {
             label: "Interpreters ",
             href: `/admin/dashboard/interpreters`,
             icon: LucideBriefcase
         },

     ]

  return (
      <>
          <div>
              <div className='flex items-center justify-center pt-8 pl-4 pb-7'>

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