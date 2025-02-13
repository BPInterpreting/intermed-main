'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Trash} from "lucide-react";
import {insertAppointmentSchema} from "@/db/schema";
import {CustomSelect} from "@/components/customUi/customSelect";
import { DatePicker } from "@/components/customUi/date-picker";
import {Textarea} from "@/components/ui/textarea";
import {TimePick} from "@/components/customUi/time-picker";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const intervalRegex = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i;

//this shcema is needed since the types are more complicated and it is easier for the types to handle
const formSchema = z.object({
    date: z.coerce.date(),
    patientId: z.string().nullable(),
    facilityId: z.string().nullable(),
    interpreterId: z.string().nullable(),
    startTime: z.string(),
    projectedEndTime: z.string().nullable(),
    duration: z.string().regex(intervalRegex, {message: 'Invalid duration format. Example: 1h30m'}).optional(),
    projectedDuration: z.string().regex(intervalRegex, {message: 'Invalid duration format. Example: 1h30m'}),
    endTime: z.string().nullable(),
    appointmentType: z.string().nullable(),
    notes: z.string().nullable().optional(),
    status: z.string().nullable()
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
    interpreterOptions: {label: string, value: string}[];
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
    interpreterOptions
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    const handleSubmit = (values: FormValues) => {
        onSubmit({
            ...values
        })
    }

    const handleDelete = () => {
        onDelete?.()
    }

   return(
               <Form {...form}>
                   <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4 ">
                       <div className='grid grid-cols-2 gap-8 '>
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
                                   name="projectedEndTime"
                                   render={({field}) => (
                                       <FormItem>
                                           <FormLabel>Projected End Time</FormLabel>
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
                           </div>
                          <div>
                              <div className={'flex flex-row gap-x-4'}>
                                  <FormField
                                      control={form.control}
                                      name="projectedDuration"
                                      render={({field}) => (
                                          <FormItem>
                                              <FormLabel>Projected Duration</FormLabel>
                                              <FormControl>
                                                  <Input
                                                      disabled={disabled}
                                                      placeholder={'1h30m'}
                                                      {...field}
                                                  />
                                              </FormControl>
                                          </FormItem>
                                      )}
                                  />
                              <FormField control={form.control} name="duration" render={({field}) => (
                                  <FormItem>
                                      <FormLabel>Duration</FormLabel>
                                      <FormControl>
                                          <Input
                                              disabled={disabled}
                                              placeholder={'1h30m'}
                                              {...field}
                                          />
                                      </FormControl>
                                  </FormItem>
                              )}/>

                              </div>
                           <FormField
                               control={form.control}
                               name="patientId"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Patient</FormLabel>
                                       <FormControl>
                                           <CustomSelect
                                               placeholder="CustomSelect a patient..."
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
                                           <CustomSelect
                                               options={facilityOptions}
                                               value={field.value}
                                               onChange={field.onChange}
                                               // onCreate={onCreateFacility}
                                               placeholder="CustomSelect a facility..."
                                               disabled={disabled}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="interpreterId"
                               render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Facility</FormLabel>
                                       <FormControl>
                                           <CustomSelect
                                               options={interpreterOptions}
                                               value={field.value}
                                               onChange={field.onChange}
                                               // onCreate={onCreateFacility}
                                               placeholder="Select an Interpreter..."
                                               disabled={disabled}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />



                           {/*<FormItem>*/}
                           {/*    <FormLabel>Appointment Type</FormLabel>*/}
                           {/*    <FormControl>*/}
                           {/*        <CustomSelect*/}
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
                           <div className='flex flex-row gap-x-4 '>
                               <FormField
                                   control={form.control}
                                   name="appointmentType"
                                   render={({ field }) => (
                                       <FormItem>
                                           <FormLabel>Appointment Type</FormLabel>
                                           <FormControl>
                                               <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                   {/* eslint-disable-next-line react/jsx-no-undef */}
                                                   <SelectTrigger className="w-[180px]">
                                                       <SelectValue placeholder="Select type" />
                                                   </SelectTrigger>
                                                   <SelectContent>
                                                       <SelectGroup>
                                                           <SelectLabel>Type</SelectLabel>
                                                           <SelectItem value="Follow-Up">Follow Up</SelectItem>
                                                           <SelectItem value="Initial">Initial</SelectItem>
                                                           <SelectItem value="IME/AME">IME/AME</SelectItem>
                                                           <SelectItem value="Second-Opinion">Second Opinion</SelectItem>
                                                           <SelectItem value="QME">QME</SelectItem>
                                                           <SelectItem value="IEP">IEP</SelectItem>
                                                           <SelectItem value="Conference">Conference</SelectItem>
                                                           <SelectItem value="Other">Other</SelectItem>
                                                       </SelectGroup>
                                                   </SelectContent>
                                               </Select>
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                               <FormField
                                   control={form.control}
                                   name="status"
                                   render={({ field }) => (
                                       <FormItem>
                                           <FormLabel>Status</FormLabel>
                                           <FormControl>
                                               <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                   {/* eslint-disable-next-line react/jsx-no-undef */}
                                                   <SelectTrigger className="w-[180px]">
                                                       <SelectValue className='pr-4' placeholder="Select Status" />
                                                   </SelectTrigger>
                                                   <SelectContent>
                                                       <SelectGroup>
                                                           <SelectLabel>Status</SelectLabel>
                                                           <SelectItem value="Pending">Pending</SelectItem>
                                                           <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                           <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                           <SelectItem value="Closed">Closed</SelectItem>
                                                       </SelectGroup>
                                                   </SelectContent>
                                               </Select>
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                           </div>
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
