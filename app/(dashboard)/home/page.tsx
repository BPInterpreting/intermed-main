'use client'

import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {MyTimeField} from "@/components/customUi/time-picker";
import TimePicker from 'react-time-picker';

const HomePage = () => {
    const patientsQuery = useGetPatients()

  return (
    <div className='flex flex-col'>
      <h1>Home Page</h1>

    </div>
  )
}

export default HomePage;