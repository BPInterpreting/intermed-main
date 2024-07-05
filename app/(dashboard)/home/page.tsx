'use client'

import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {DataGrid} from "@/components/customUi/data-grid";
import {DataCharts} from "@/components/customUi/data-charts";


const HomePage = () => {
    const patientsQuery = useGetPatients()

  return (
    <div className='flex flex-col mx-auto p-8'>
      <DataGrid />
      <DataCharts />
    </div>
  )
}

export default HomePage;