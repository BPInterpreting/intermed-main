'use client'

import {Chart} from "@/components/customUi/chart";

export const DataCharts = () => {
    return(
        <div className='grid grid-cols-1 lg:grid-cols-6 gap-8'>
            <div className='col-span-1 lg:col-span-3 xl:col-span-4'>
                <Chart />
            </div>
        </div>
    )
}