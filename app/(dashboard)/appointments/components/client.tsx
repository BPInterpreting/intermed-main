'use client'

import {Heading} from "@/components/customUi/heading";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import HeadingContainer from "@/components/customUi/headingContainer";
import {DataTable} from "@/components/ui/data-table";


// interface PatientClientProps {
//     data: PatientsColumn[];
// }

const AppointmentsClient = (
) => {
    return (
        <>
            <HeadingContainer>
                <Heading
                    title={"Appointments"}
                    description={"List of all appointments"}
                />
                <Button
                    className='items-center'
                >
                    <span className="font-bold pr-1 text-lg">+</span>
                    Appointment
                </Button>
            </HeadingContainer>
            <Separator />
            {/*TODO: data is not defined fix it so that the data can be displayed*/}
            {/*<DataTable columns={columns} data={data}  />*/}

        </>
    )
}

export default AppointmentsClient;

