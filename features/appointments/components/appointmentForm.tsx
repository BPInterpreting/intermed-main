'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel,} from "@/components/ui/form"
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
import {Switch} from "@/components/ui/switch";

const intervalRegex = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i;

//this schema is used for the default values of the form mainly due to the use of coercion and regex
//and also ensures that the data is in the correct format
const formSchema = z.object({
    date: z.coerce.date(),
    patientId: z.string().nullable(),
    facilityId: z.string().nullable(),
    interpreterId: z.string().nullable(),
    startTime: z.string(),
    projectedEndTime: z.string().nullable(),
    // duration: z.string().regex(intervalRegex, {message: 'Invalid duration format. Example: 1h30m'}).nullable(),
    projectedDuration: z.string().regex(intervalRegex, {message: 'Invalid duration format. Example: 1h30m'}).nullable(),
    endTime: z.string().nullable().optional(),
    appointmentType: z.string().nullable(),
    isCertified: z.boolean().optional(),
    notes: z.string().nullable().optional(),
    status: z.string().nullable()
})

//this api schema is used in the onSubmit function to send the data to the server
//simple all true values to allow the data to pass in the onSubmit
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
                   <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                       console.error("Validation failed", JSON.stringify(errors, null, 2));})} className="space-y-2 pt-4 ">
                       <div className='grid grid-cols-1 gap-1 '>
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
                           <div className='flex flex-row  gap-x-4'>
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
                           </div>
                           </div>
                          <div>
                              <div className={'flex flex-row'}>
                                  <div className={'mr-5'}>
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
                                  <div >
                                      <FormField
                                          control={form.control}
                                          name="projectedDuration"
                                          render={({field}) => (
                                              <FormItem>
                                                  <FormLabel className={'ml-8'}>Projected Duration</FormLabel>
                                                  <FormControl>
                                                      <Input
                                                          disabled={disabled}
                                                          placeholder={'1h30m'}
                                                          {...field}
                                                          value={field.value ?? ""}
                                                          className={'ml-8 w-28'}
                                                      />
                                                  </FormControl>
                                              </FormItem>
                                          )}
                                      />
                                  </div>
                              </div>
                           <FormField
                               control={form.control}
                               name="patientId"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Patient</FormLabel>
                                       <FormControl>
                                           <CustomSelect
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
                                           <CustomSelect
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
                           <FormField
                               control={form.control}
                               name="interpreterId"
                               render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Interpreter</FormLabel>
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
                                                           <SelectItem value="Pending Confirmation">Pending Confirmation</SelectItem>
                                                           <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                           <SelectItem value="Closed">Closed</SelectItem>
                                                           <SelectItem value="Interpreter Requested">Interpreter Requested</SelectItem>
                                                           <SelectItem value="Pending Authorization">Pending Authorization</SelectItem>
                                                           <SelectItem value="Late CX">Late CX</SelectItem>
                                                           <SelectItem value="No Show">No Show</SelectItem>
                                                       </SelectGroup>
                                                   </SelectContent>
                                               </Select>
                                           </FormControl>
                                       </FormItem>
                                   )}
                               />
                           </div>
                              <div className='mt-2'>
                                  <FormField
                                      control={form.control}
                                      name="isCertified"
                                      render={({field}) => (
                                          <FormItem className="relative rounded-lg border p-3 shadow-sm h-24">
                                              <FormLabel className='mb-4'>Switch If Certification Required</FormLabel>
                                              <FormControl>
                                                  <div className='absolute right-4'>
                                                      <Switch
                                                          checked={field.value ?? undefined}
                                                          onCheckedChange={field.onChange}
                                                      />
                                                  </div>

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
