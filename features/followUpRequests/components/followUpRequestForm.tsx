'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch";
import {Trash} from "lucide-react";
import {insertFollowUpRequestSchema, insertInterpreterSchema} from "@/db/schema";
import {PhoneInput} from "@/components/customUi/phone-input";
import {DatePicker} from "@/components/customUi/date-picker";
import {TimePick} from "@/components/customUi/time-picker";
import {Textarea} from "@/components/ui/textarea";

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const formSchema = insertFollowUpRequestSchema.pick({
    date: true,
    startTime: true,
    projectedDuration: true,
    notes: true,
    appointmentType: true,
    status: true,
})

type FormValues = z.input<typeof formSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

export const FollowUpRequestForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
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
           <div>
               <Form {...form}>
                   <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                       <div className='grid grid-cols-2 space-x-4'>
                           <FormField
                               control={form.control}
                               name="date"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Date</FormLabel>
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
                               name="projectedDuration"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Projected Duration</FormLabel>
                                       <FormControl>
                                           <Input
                                               disabled={disabled}
                                               placeholder={'1h30m'}
                                               {...field}
                                               value={field.value || ""}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="notes"
                               render={({field}) => (
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
                           {id ? "Update Follow Up Request" : "Add Follow Up Request"}
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
                                 Delete Follow Up Request
                            </Button>
                       )}
                   </form>
               </Form>
           </div>

   )
}
