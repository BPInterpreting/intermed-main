import { auth } from '@clerk/nextjs/server'
import {Roles} from "@/types/globals";


export const checkRole = async (role: Roles) => {
    const { sessionClaims } = await auth()
    console.log('user role:', sessionClaims?.metadata.role)
    return sessionClaims?.metadata.role === role
}