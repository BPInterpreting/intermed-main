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
import {insertInterpreterSchema} from "@/db/schema";
import {PhoneInput} from "@/components/customUi/phone-input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const formSchema = insertInterpreterSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phoneNumber: true,
    isCertified: true,
    // targetLanguages: true,
    // isCertified: true,
    // specialty: true,
    // coverageArea: true
})

type FormValues = z.input<typeof formSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

export const InterpreterForm = ({
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
                   <div className='grid grid-cols-2 space-x-4 gap-2'>
                       <FormField
                           control={form.control}
                           name="firstName"
                           render={({field}) => (
                               <FormItem>
                                   <FormLabel htmlFor='firstName'>First Name</FormLabel>
                                   <FormControl>
                                       <Input
                                           className='capitalize'
                                           id='firstName'
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
                                   <FormLabel htmlFor='lastName'>Last Name</FormLabel>
                                   <FormControl>
                                       <Input
                                           className='capitalize'
                                           id='lastName'
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
                                   <FormLabel htmlFor='email'>Email</FormLabel>
                                   <FormControl>
                                       <Input
                                           id='email'
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
                           name="isCertified"
                           render={({field}) => (
                               <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2">
                                   <FormLabel >isCertified</FormLabel>
                                   <FormControl>
                                       <Switch
                                           checked={field.value ?? undefined}
                                           onCheckedChange={field.onChange}
                                       />
                                   </FormControl>
                               </FormItem>
                           )}
                       />
                       {/*<FormField*/}
                       {/*    control={form.control}*/}
                       {/*    name="targetLanguages"*/}
                       {/*    render={({field}) => (*/}
                       {/*        <FormItem>*/}
                       {/*            <FormLabel>Target Language</FormLabel>*/}
                       {/*            <FormControl>*/}
                       {/*                <Input*/}
                       {/*                    placeholder="Language"*/}
                       {/*                    {...field}*/}
                       {/*                    value={field.value || ""}*/}
                       {/*                />*/}
                       {/*            </FormControl>*/}
                       {/*        </FormItem>*/}
                       {/*    )}*/}
                       {/*/>*/}
                       {/* <FormField*/}
                       {/*      control={form.control}*/}
                       {/*      name="isCertified"*/}
                       {/*      render={({field}) => (*/}
                       {/*           <FormItem>*/}
                       {/*             <FormLabel>Is Certified? </FormLabel>*/}
                       {/*             <FormControl>*/}
                       {/*                 <Switch*/}
                       {/*                     checked={field.value}*/}
                       {/*                     onCheckedChange={field.onChange}*/}
                       {/*                 />*/}
                       {/*             </FormControl>*/}
                       {/*           </FormItem>*/}
                       {/*      )}*/}
                       {/* />*/}
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
