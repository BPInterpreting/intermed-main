'use client'

import {DataGrid} from "@/components/customUi/data-grid";
import {DataCharts} from "@/components/customUi/data-charts";
import {DailyAppointmentsWidget} from "@/components/customUi/daily-appointment-data-table";
import {NotificationListener} from "@/components/customUi/notification-listener";
import {toast} from "sonner";

const HomePage =   () => {

    return (
        <div className='flex flex-col mx-2 p-4 gap-y-8'>
            <div className='flex flex-col '>
                <DataGrid/>
                <DataCharts/>
            </div>
            <div>
                <DailyAppointmentsWidget/>
            </div>
        </div>
    )
}

export default HomePage;