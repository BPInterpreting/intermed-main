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

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const formSchema = insertPatientSchema.pick({
    firstName: true,
})

type FormValues = z.input<typeof formSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

const PatientForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
}: Props) => {

    const title = "Add Patient"
    const description = "Add a new patient to the system"

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
               <div className="flex items-center justify-between">
                   {/* eslint-disable-next-line react/jsx-no-undef */}
                   <Heading title={title} description={description}/>
                   {/*button conditionally renders only if id exists. meaning data already exists for it*/}
                   {!!id && <Button
                       type='button'
                       disabled={disabled}
                       variant='destructive'
                       size='sm'
                       onClick={handleDelete}
                   >
                       <Trash className="h-4 w-4"/>
                   </Button>}
               </div>

               <Form {...form}>
                   <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full">
                       <div className='grid grid-cols-3 gap-8'>
                           <FormField
                               control={form.control}
                               name="firstName"
                               render={({field}) => (
                                   <FormItem>
                                       <FormLabel>First Name</FormLabel>
                                       <FormControl>
                                           <Input placeholder="first name" {...field} />
                                       </FormControl>
                                   </FormItem>
                               )}
                           />
                       </div>

                       <Button>
                           {id ? "Update Patient" : "Add Patient"}
                       </Button>
                   </form>
               </Form>
           </div>
       </>
   )
}
export default PatientForm