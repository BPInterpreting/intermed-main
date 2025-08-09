'use client'

import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Trash} from "lucide-react";
import {insertFacilitySchema} from "@/db/schema";
import {PhoneInput} from "@/components/customUi/phone-input";
import {useEffect} from "react";
import dynamic from "next/dynamic";

// Import your working GoogleMapComponent
const GoogleMapComponent = dynamic(
    () => import('@/components/customUi/google-map'),
    {
        ssr: false,
        loading: () => <div className='h-96 flex items-center justify-center bg-gray-100 rounded-md'><p>Loading map...</p></div>
    }
);

const formSchema = z.object({
    name: z.string(),
    address: z.string(),
    longitude: z.coerce.number(),
    latitude: z.coerce.number(),
    email: z.string()
        .email("Invalid email format. Please leave blank if not applicable.")
        .or(z.literal("")) // Allow an empty string as valid input
        .optional()
        .transform(e => e === "" ? undefined : e),
    phoneNumber: z.string().optional(),
    facilityType: z.string(),
    operatingHours: z.string(),
    averageWaitTime: z.string(),
})

// modified formSchema to only include firstName based on drizzle insertPatientSchema
const apiSchema = insertFacilitySchema.pick({
    name: true,
    address: true,
    longitude: true,
    latitude: true,
    email: true,
    phoneNumber: true,
    facilityType: true,
    operatingHours: true,
    averageWaitTime: true,
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
        console.log("Form values on submit:", values)
        onSubmit({
            ...values,
            longitude: values.longitude.toString(),
            latitude: values.latitude.toString(),
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Google Maps Component */}
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

                    {/* Other Form Fields */}
                    <div className='grid grid-cols-2 gap-x-4 gap-y-6'>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            className='capitalize'
                                            placeholder="Facility Name"
                                            disabled={disabled}
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
                                            value={field.value || ''}
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
                                            {...field}
                                            type={"email"}
                                            placeholder="example@email.com"
                                            value={field.value || ''}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="facilityType"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Facility Type</FormLabel>
                                    <FormControl>
                                        <Input
                                            className='capitalize'
                                            placeholder="Enter specialty"
                                            disabled={disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="operatingHours"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Operating Hours</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="9:00am-5:00pm"
                                            disabled={disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="averageWaitTime"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Average Wait Time</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="1h30m"
                                            disabled={disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Hidden fields for form data */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({field}) => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="latitude"
                        render={({field}) => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="longitude"
                        render={({field}) => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Submit and Delete Buttons */}
                    <Button className='w-full mt-8' disabled={disabled}>
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
    )
}