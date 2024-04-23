"use client"

import {usePathname} from "next/navigation";
import {Fullscreen, GaugeCircle, NotebookText} from "lucide-react";
import {NavItems} from "@/app/(dashboard)/_components/sidebar/nav-items";
import {map} from "zod";

export const Navigation = () => {
    // this is the hook that is used to read the pathname. if the pathname mathces the route it will be true
    const pathname = usePathname()

    // routes are the array of objects that are used to create the navigation links
     const routes = [
         {
             label: "Home",
             href: `/`,
             icon: GaugeCircle
         },
        {
            label: "Appointments ",
            href: `/appointments`,
            icon: NotebookText
        },

     ]

  return (
      <ul>
          {routes.map((route) => (
              <NavItems
                  key={route.href}
                  href={route.href}
                  icon={route.icon}
                  label={route.label}
                  isActive={pathname === route.href} />
          ))}
      </ul>

  )
}

export default Navigation;