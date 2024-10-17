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
import { Switch } from "@/components/ui/switch";
import {Heading} from "@/components/customUi/heading";
import {Trash} from "lucide-react";
import {insertInterpreterSchema} from "@/db/schema";
import {PhoneInput} from "@/components/customUi/phone-input";

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const formSchema = insertInterpreterSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phoneNumber: true,
    targetLanguages: true,
    isCertified: true,
    specialty: true,
    coverageArea: true
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
                       <div className='grid grid-cols-2 space-x-4'>
                           <FormField
                               control={form.control}
                               name="firstName"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>First Name</FormLabel>
                                       <FormControl>
                                           <Input
                                               placeholder="first name..."
                                               {...field}
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
                               name="targetLanguages"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>Target Language</FormLabel>
                                       <FormControl>
                                           <Input
                                               placeholder="Language"
                                               {...field}
                                               value={field.value || ""}
                                           />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                            <FormField
                                 control={form.control}
                                 name="isCertified"
                                 render={({field}) => (
                                      <FormItem>
                                        <FormLabel>Is Certified? </FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                      </FormItem>
                                 )}
                            />
                       </div>
                       <Button className='w-full'>
                           {id ? "Update Interpreter" : "Add Interpreter"}
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
                                 Delete Interpreter
                            </Button>
                       )}
                   </form>
               </Form>
           </div>

   )
}