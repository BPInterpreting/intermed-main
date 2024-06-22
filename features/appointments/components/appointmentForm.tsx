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
import {TimePick} from "@/components/customUi/time-picker";


//this shcema is needed since the types are more complicated and it is easier for the types to handle
const formSchema = z.object({
    date: z.coerce.date(),
    patientId: z.string().nullable(),
    facilityId: z.string().nullable(),
    startTime: z.string(),
    endTime: z.string().nullable(),
    appointmentType: z.string().nullable(),
    notes: z.string().nullable().optional()
})

//regular api schema that is used in other forms
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
    // onCreateFacility: (name: string) => void
    // onCreatePatient: (firstName: string) => void
}

export const AppointmentForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
    patientOptions,
    facilityOptions,
    // onCreateFacility,
    // onCreatePatient
}: Props) => {

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    const handleSubmit = (values: FormValues) => {
        onSubmit({
            ...values
        })
        console.log(values)
    }

    const handleDelete = () => {
        onDelete?.()
    }

   return(
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
                           <div className='flex flex-row items-center gap-x-4'>
                               <FormField
                                   control={form.control}
                                   name="startTime"
                                   render={({field}) => (
                                       <FormItem>
                                           <FormLabel>Start Time</FormLabel>
                                           <FormControl>
                                               <TimePick
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
                                   name="endTime"
                                   render={({field}) => (
                                       <FormItem>
                                           <FormLabel>End Time</FormLabel>
                                           <FormControl>
                                               <TimePick
                                                   value={field.value ?? ""}
                                                   onChange={field.onChange}
                                                   disabled={disabled}
                                               />
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                           </div>
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
                                               // onCreate={onCreatePatient}
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
                                       <FormLabel>Facility</FormLabel>
                                       <FormControl>
                                           <Select
                                               options={facilityOptions}
                                               value={field.value}
                                               onChange={field.onChange}
                                               // onCreate={onCreateFacility}
                                               placeholder="Select a facility..."
                                               disabled={disabled}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           {/*<FormItem>*/}
                           {/*    <FormLabel>Appointment Type</FormLabel>*/}
                           {/*    <FormControl>*/}
                           {/*        <Select*/}
                           {/*            options={[*/}
                           {/*                {label: "In-person", value: "in-person"},*/}
                           {/*                {label: "Virtual", value: "virtual"},*/}
                           {/*                {label: "Phone", value: "phone"},*/}
                           {/*            ]}*/}
                           {/*            value={form.getValues("appointmentType")}*/}
                           {/*            onChange={(value) => form.setValue("appointmentType", value)}*/}
                           {/*            disabled={disabled}*/}
                           {/*        />*/}
                           {/*    </FormControl>*/}
                           {/*</FormItem>*/}
                           <FormField
                               control={form.control}
                               name="appointmentType"
                               render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Appointment Type</FormLabel>
                                       <FormControl>
                                             <Input
                                                  {...field}
                                                  value={field.value ?? ""}
                                                  disabled={disabled}
                                                  placeholder="Enter appointment type..."
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
                                               value={field.value ?? ""}
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
                                 Delete Appointment
                            </Button>
                       )}
                   </form>
               </Form>

   )
}
