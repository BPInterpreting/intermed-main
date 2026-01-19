import { auth } from '@clerk/nextjs/server'
import {Roles} from "@/types/globals";
import { getRoleFromClaims } from "@/utils/get-role";


export const checkRole = async (role: Roles) => {
    const { sessionClaims } = await auth()
    const currentRole = getRoleFromClaims(sessionClaims as { metadata?: { role?: string }, publicMetadata?: { role?: string } })
    console.log('user role:', currentRole)
    return currentRole === role
}