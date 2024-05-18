'use client'

import {useGetPatients} from "@/features/patients/api/use-get-patients";

const HomePage = () => {
    const patientsQuery = useGetPatients()

  return (
    <div className='flex flex-col'>
        {patientsQuery.data?.map((patient) => (
            <div key={patient.id}>
                <h1>{patient.firstName}</h1>
            </div>
        ))}
      <h1>Home Page</h1>
    </div>
  )
}

export default HomePage;