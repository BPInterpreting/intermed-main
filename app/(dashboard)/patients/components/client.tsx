'use client'

import {Heading} from "@/components/customUi/heading";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import HeadingContainer from "@/components/customUi/headingContainer";
import {DataTable} from "@/components/ui/data-table";
import {columns} from "./columns";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Plus} from "lucide-react";
import { useNewPatient } from "@/app/(dashboard)/patients/hooks/use-new-patient";
import {useGetPatients} from "@/app/(dashboard)/patients/api/use-get-patients";



type Patient = {
    id: string
    firstName: string
}



const PatientsClient = (
) => {
    const newPatient = useNewPatient()
    const router = useRouter();
    const patientsQuery = useGetPatients()
    const patients = patientsQuery.data || []

  return (
      <>
          <div className='w-full pb-10'>
              <Card className=''>
                  <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                      <CardTitle className='text-3xl line-clamp-1'>Patients</CardTitle>
                      <Button
                          onClick = {newPatient.onOpen}
                      >
                          <Plus className='size-4 mr-2'/>
                          Add Patient
                      </Button>
                  </CardHeader>
                  <CardContent>
                      <DataTable columns={columns} data={patients}/>
                  </CardContent>
              </Card>
          </div>


      </>
  )
}


export default PatientsClient;

