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

            {/*<SearchUsers />*/}

            {/*{users.map((user) => {*/}
            {/*    return (*/}
            {/*        <div key={user.id}>*/}
            {/*            <div>*/}
            {/*                {user.firstName} {user.lastName}*/}
            {/*            </div>*/}

            {/*            <div>*/}
            {/*                {*/}
            {/*                    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)*/}
            {/*                        ?.emailAddress*/}
            {/*                }*/}
            {/*            </div>*/}

            {/*            <div>{user.publicMetadata.role as string}</div>*/}

            {/*            <form action={setRole}>*/}
            {/*                <input type="hidden" value={user.id} name="id" />*/}
            {/*                <input type="hidden" value="admin" name="role" />*/}
            {/*                <button type="submit">Make Admin</button>*/}
            {/*            </form>*/}

            {/*            <form action={setRole}>*/}
            {/*                <input type="hidden" value={user.id} name="id" />*/}
            {/*                <input type="hidden" value="moderator" name="role" />*/}
            {/*                <button type="submit">Make Moderator</button>*/}
            {/*            </form>*/}

            {/*            <form action={removeRole}>*/}
            {/*                <input type="hidden" value={user.id} name="id" />*/}
            {/*                <button type="submit">Remove Role</button>*/}
            {/*            </form>*/}
            {/*        </div>*/}
            {/*    )*/}
            {/*})}*/}

            <DataGrid/>
            <DataCharts/>
        </div>
    )
}

export default HomePage;