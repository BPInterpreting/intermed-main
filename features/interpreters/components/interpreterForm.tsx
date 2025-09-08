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
import {useEffect} from "react";
import {useAuth} from "@clerk/nextjs";
import dynamic from "next/dynamic";

// // modified formSchema to only include firstName based on drizzle insertPatientSchema
// const formSchema = insertInterpreterSchema.pick({
//     firstName: true,
//     lastName: true,
//     email: true,
//     phoneNumber: true,
//     isCertified: true,
//     // targetLanguages: true,
//     // isCertified: true,
//     // specialty: true,
//     // coverageArea: true
// })

const GoogleMapComponent = dynamic(
    () => import('@/components/customUi/google-map'),
    {
        ssr: false,
        loading: () => <div className='h-96 flex items-center justify-center bg-gray-100 rounded-md'><p>Loading map...</p></div>
    }
);

const formSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    longitude: z.coerce.number(),
    latitude: z.coerce.number(),
    email: z.string().email(),
    phoneNumber: z.string(),
    isCertified: z.boolean()
})

const apiSchema = insertInterpreterSchema.omit({
    id: true
})

type FormValues = z.input<typeof formSchema>
type ApiValues = z.input<typeof apiSchema>

type Props ={
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: ApiValues) => void;
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

    const { userId } = useAuth();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    function handleSubmit(values: FormValues) {
        if (!userId) {
            // Optional: Handle case where user is not logged in
            return;
        }

        onSubmit({
            ...values,
            longitude: values.longitude.toString(),
            latitude: values.latitude.toString(),
            clerkUserId: userId,
        })
    }

    const handleDelete = () => {
        onDelete?.()
    }

    const handleLocationSelected = (address: string, latitude: number, longitude: number) => {
        console.log("Location selected:", { address, latitude, longitude })
        form.setValue("address", address);
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
    }

    useEffect(() => {
        console.log("Form values:", form.getValues());
    }, [form.watch()]);

    // Check if we have coordinates to show initial location
    const hasCoordinates = form.getValues('latitude') !== 0 && form.getValues('longitude') !== 0;

   return(
       <div>
           <Form {...form}>
               <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                   {/*google map component */}
                   <div className='mb-6'>
                       <FormLabel className="text-base font-semibold">Location</FormLabel>
                       <p className="text-sm text-gray-600 mb-3">
                           Search for the facility address or click on the map to set the location.
                       </p>
                       <GoogleMapComponent
                           onLocationSelected={handleLocationSelected}
                           initialLatitude={hasCoordinates ? form.getValues('latitude') : undefined}
                           initialLongitude={hasCoordinates ? form.getValues('longitude') : undefined}
                           initialAddress={form.getValues('address') || ''}
                           height={400}
                           className="rounded-lg shadow-sm"
                       />
                   </div>
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
