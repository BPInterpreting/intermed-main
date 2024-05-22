// 'use client'
//
// import PatientForm from "@/app/(dashboard)/patients/components/patientForm";
// import {insertPatientSchema} from "@/db/schema";
// import {z} from "zod";
// import {useCreatePatient} from "@/app/(dashboard)/patients/api/use-create-patient";
// import {useRouter} from "next/navigation";
//
// const formSchema = insertPatientSchema.pick({
//     firstName: true,
// })
//
// type FormValues = z.input<typeof formSchema>
//
// const PatientsPage = () => {
//     const router = useRouter()
//
//     const onSubmit = (values: FormValues) => {
//         mutation.mutate(values)
//
//     }
//
//     const mutation = useCreatePatient()
//
//     return (
//         <div className='flex-col'>
//             <div className='flex-1 space-y-4 p-8 pt-6'  >
//                 <PatientForm
//                     onSubmit={onSubmit}
//                     disabled={mutation.isPending}
//                     defaultValues={{
//                         firstName: ''
//                     }}
//                 />
//             </div>
//         </div>
//
//     )
// }
//
// export default PatientsPage;
