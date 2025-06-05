'use client'

import {DataGrid} from "@/components/customUi/data-grid";
import {DataCharts} from "@/components/customUi/data-charts";
import TodaysAppointmentTable from "@/components/customUi/todays-appointment-table";

const HomePage =   () => {

    return (
        <div className='flex flex-col mx-2 p-4 gap-y-8'>
            <div className='flex flex-col '>
                <DataGrid/>
                <DataCharts/>
            </div>
            <div>
                <TodaysAppointmentTable/>
            </div>
        </div>
    )
}

export default HomePage;