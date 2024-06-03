'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Trash} from "lucide-react";
import {insertFacilitySchema} from "@/db/schema";

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const formSchema = insertFacilitySchema.pick({
    name: true,
})

type FormValues = z.input<typeof formSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

export const FacilityForm = ({
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
