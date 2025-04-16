'use client'

import {DataGrid} from "@/components/customUi/data-grid";
import {DataCharts} from "@/components/customUi/data-charts";

const HomePage =   () => {

    return (
        <div className='flex flex-col mx-auto p-8'>
            <DataGrid/>
            <DataCharts/>
        </div>
    )
}

export default HomePage;