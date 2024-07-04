'use client'

import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {DataGrid} from "@/components/customUi/data-grid";


const HomePage = () => {
    const patientsQuery = useGetPatients()

  return (
    <div className='flex flex-col mx-auto p-8'>
      <DataGrid />

    </div>
  )
}

export default HomePage;