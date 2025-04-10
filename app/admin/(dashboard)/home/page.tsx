'use client'

import {useGetPatients} from "@/features/patients/api/use-get-patients";
import {DataGrid} from "@/components/customUi/data-grid";
import {DataCharts} from "@/components/customUi/data-charts";
import { redirect } from 'next/navigation'

import {clerkClient} from "@clerk/nextjs/server";
import {SearchUsers} from "@/app/admin/SearchUsers";
import {removeRole, setRole} from "@/app/admin/_actions";
import {checkRole} from "@/utils/roles";
// const patientsQuery = useGetPatients()

const HomePage =   () => {


    // const query = params.searchParams.search
    // const users = query ? (await clerkClient().users.getUserList({query})).data : []

    return (
        <div className='flex flex-col mx-auto p-8'>
            <DataGrid/>
            <DataCharts/>
        </div>
    )
}

export default HomePage;