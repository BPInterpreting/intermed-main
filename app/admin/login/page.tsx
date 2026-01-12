import { SignIn, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="font-bold text-3xl text-foreground">
                        Admin Access
                    </h1>
                    <p className="text-muted-foreground text-base">
                        Sign in to access the admin dashboard
                    </p>
                </div>
                <div className="flex items-center justify-center">
                    <ClerkLoaded>
                        <SignIn
                            appearance={{
                                elements: {
                                    card: {
                                        boxShadow: "none",
                                        border: "1px solid hsl(var(--border))",
                                    }
                                }
                            }}
                        />
                    </ClerkLoaded>
                    <ClerkLoading>
                        <Loader2 className="animate-spin text-muted-foreground"/>
                    </ClerkLoading>
                </div>
            </div>
        </div>
    )
}
