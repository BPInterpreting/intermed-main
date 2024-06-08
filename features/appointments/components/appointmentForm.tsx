'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Trash} from "lucide-react";
import {insertAppointmentSchema} from "@/db/schema";
import {Select} from "@/components/customUi/select";
import { DatePicker } from "@/components/customUi/date-picker";
import {Textarea} from "@/components/ui/textarea";


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
        console.log({values})
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
                               name="date"
                               render={({field}) => (
                                   <FormItem>
                                       <FormControl>
                                             <DatePicker
                                                  value={field.value}
                                                  onChange={field.onChange}
                                                  disabled={disabled}
                                             />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="patientId"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Patient</FormLabel>
                                       <FormControl>
                                           <Select
                                               placeholder="Select a patient..."
                                               options={patientOptions}
                                               onCreate={onCreatePatient}
                                               value={field.value}
                                               onChange={field.onChange}
                                               disabled={disabled}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="facilityId"
                               render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Category</FormLabel>
                                       <FormControl>
                                           <Select
                                               options={facilityOptions}
                                               value={field.value}
                                               onChange={field.onChange}
                                               onCreate={onCreateFacility}
                                               placeholder="Select an category"
                                               disabled={disabled}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="notes"
                               render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Notes</FormLabel>
                                       <FormControl>
                                           <Textarea
                                               {...field}
                                               value={field.value || ""}
                                               disabled={disabled}
                                               placeholder="Optional notes..."
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                       </div>
                       <Button className='w-full'>
                           {id ? "Update Appointment" : "Add Appointment"}
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
