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

type Patient = {
    id: string
    firstName: string
}

const data: Patient[] = [
    {
        id: "728ed52f",
        firstName: "bryan ",
    },
    {
        id: "489e1d42",
        firstName: "celene",
    },
    // ...
]

const PatientsClient = (
) => {

    const router = useRouter();
  return (
      <>
          <div className='w-full pb-10'>
              <Card className=''>
                  <CardHeader className='gap-y-2 lg:flex-row lg:justify-between'>
                      <CardTitle className='text-3xl line-clamp-1'>Patients</CardTitle>
                      <Button
                          onClick = {() => router.push("/patients/new")}
                      >
                          <Plus className='size-4 mr-2'/>
                          Add Patient
                      </Button>
                  </CardHeader>
                  <CardContent>
                      <DataTable columns={columns} data={data}/>
                  </CardContent>
              </Card>
          </div>


      </>
  )
}


export default PatientsClient;

