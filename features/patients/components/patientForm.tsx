'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {Heading} from "@/components/customUi/heading";
import {Trash} from "lucide-react";
import {insertPatientSchema} from "@/db/schema";
import {PhoneInput} from "@/components/customUi/phone-input";

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const formSchema = insertPatientSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phoneNumber: true,
    insuranceCarrier: true,
    preferredLanguage: true
})



type FormValues = z.input<typeof formSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

export const PatientForm = ({
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
                       <div className='grid grid-cols-2 gap-2'>
                           <FormField
                               control={form.control}
                               name="firstName"
                               render={({field}) => (
                                   <FormItem >
                                       <FormLabel>First Name</FormLabel>
                                       <FormControl>
                                           <Input
                                               placeholder="first name..."
                                               {...field}
                                               className='capitalize'
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="lastName"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Last Name</FormLabel>
                                       <FormControl>
                                           <Input
                                               placeholder="last name..."
                                               {...field}
                                               className='capitalize'
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="email"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Email</FormLabel>
                                       <FormControl>
                                           <Input
                                               placeholder="example@email.com"
                                               type={"email"}
                                               {...field}
                                               value={field.value || ""}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="phoneNumber"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Phone Number</FormLabel>
                                       <FormControl>
                                           <PhoneInput
                                               {...field}
                                               format='(###) ###-####'
                                               allowEmptyFormatting={true}
                                               mask="_"
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                           <FormField
                               control={form.control}
                               name="insuranceCarrier"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Insurance carrier</FormLabel>
                                       <FormControl>
                                           <Input
                                               placeholder="Insurance Inc"
                                               {...field}
                                               value={field.value || ""}
                                               className='capitalize'
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                            <FormField
                                 control={form.control}
                                 name="preferredLanguage"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>Preferred Language</FormLabel>
                                        <FormControl>
                                             <Input
                                                  placeholder="English"
                                                  {...field}
                                                 value={field.value || ""}
                                                  className='capitalize'
                                             />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                       </div>
                       <Button className='w-full'>
                           {id ? "Update Patient" : "Add Patient"}
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
                                 Delete Patient
                            </Button>
                       )}
                   </form>
               </Form>
           </div>

   )
}
