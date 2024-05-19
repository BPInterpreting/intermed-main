'use client'

import PatientForm from "@/app/(dashboard)/patients/[patientId]/components/patientForm";
import {insertPatientSchema} from "@/db/schema";
import {z} from "zod";

const formSchema = insertPatientSchema.pick({
    firstName: true,
})

type FormValues = z.input<typeof formSchema>

const onSubmit = (values: FormValues) => {
    console.log(values)
}

const PatientsPage = () => {
    return (
        <div className='flex-col'>
            <div className='flex-1 space-y-4 p-8 pt-6'  >
                <PatientForm
                    onSubmit={onSubmit}
                    disabled={false}
                    defaultValues={{
                        firstName: ''
                    }}
                />
            </div>
        </div>

    )
}

export default PatientsPage;
