import { auth } from '@clerk/nextjs/server'
import {Roles} from "@/types/globals";


export const checkRole = async (role: Roles) => {
    const { sessionClaims } = await auth()
    const currentRole = (sessionClaims?.metadata as { role?: string })?.role
    console.log('user role:', currentRole)
    return currentRole === role
}
