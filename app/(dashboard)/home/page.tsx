'use client'

import {useGetPatients} from "@/features/patients/api/use-get-patients";

const HomePage = () => {
    const patientsQuery = useGetPatients()

  return (
    <div className='flex flex-col'>
      <h1>Home Page</h1>
    </div>
  )
}

export default HomePage;