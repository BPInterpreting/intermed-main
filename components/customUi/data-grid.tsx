'use client'
import {CalendarCheck, CalendarClock, CalendarMinus} from "lucide-react";

import {useSearchParams} from "next/navigation";
import {DataCard} from "@/components/customUi/data-card";

export const DataGrid = () => {
    const params = useSearchParams()

    return(
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8'>
            <DataCard
                title={'Appointments Today'}
                icon={CalendarClock}
            />
            <DataCard icon={CalendarMinus} title={'Appointments not Closed'} />

        {/*    TODO: Pie chart that shows distribution of facilities in percentage */}

        </div>
    )
}