//all comppnents of the sidebar are rendered here


import Navigation from "@/app/(dashboard)/_components/sidebar/navigation";
import {cn} from "@/lib/utils";

interface SidebarProps {
    className?: string;
}

export const Sidebar = ({className}: SidebarProps) => {
    return (
        // these are the general classnames that are applied to the sidebar, the classname is passed as a prop in case changes are needed or prevent some behavior
        <div className={cn('flex flex-col fixed inset-y-0 left-0 top-0 w-60 z-50 bg-secondary h-full border-r-2 shadow-sm', className)}>
            <Navigation />
        </div>
    )
}