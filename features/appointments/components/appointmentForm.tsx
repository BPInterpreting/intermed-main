'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Trash} from "lucide-react";
import {insertAppointmentSchema} from "@/db/schema";

//this shcema is needed since the types are more complicated and it is easier for the types to handle
const formSchema = z.object({
   date: z.coerce.date(),
    patientId: z.string(),
    facilityId: z.string(),
    notes: z.string().nullable().optional()
})

//regular api shcema that is used in other forms
const apiSchema = insertAppointmentSchema.omit({
    id:true
})

type FormValues = z.input<typeof formSchema>
type ApiFormValues = z.input<typeof apiSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: ApiFormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
    //arrays of values for label and value
    patientOptions: {label: string, value: string}[];
    facilityOptions: {label: string, value: string}[];
    onCreateFacility: (name: string) => void
    onCreatePatient: (firstName: string) => void
}

export const AppointmentForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
    patientOptions,
    facilityOptions,
    onCreateFacility,
    onCreatePatient
}: Props) => {

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    function handleSubmit(values: FormValues) {
        onSubmit(values)
    }

    const handleDelete = () => {
        onDelete?.()
    }

   return(
       <>
           <div>
               <Form {...form}>
                   <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                       <div className='grid grid-cols-3 gap-8'>
                           <FormField
                               control={form.control}
                               name="name"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Name</FormLabel>
                                       <FormControl>
                                           <Input
                                               placeholder="Clinic Name"
                                               {...field}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                       </div>
                       <Button className='w-full'>
                           {id ? "Update Facility" : "Add Facility"}
                       </Button>
                       {!!id && (
                            <Button
                                type='button'
                                disabled={disabled}
                                variant="destructive"
                                className='w-full'
                                onClick={handleDelete}
                            >
                                 <Trash className='size-4 mr-2'/>
                                 Delete Facility
                            </Button>
                       )}
                   </form>
               </Form>
           </div>
       </>
   )
}
