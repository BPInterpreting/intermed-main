export {}

// Create a type for the roles. clerk RBAC function for auto-completion and type checking
export type Roles = 'admin' | 'moderator'

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        }
    }
}