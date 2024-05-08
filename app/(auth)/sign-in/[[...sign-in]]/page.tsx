import { SignIn, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Page() {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            <div className="h-full lg:flex flex-col items-center justify-center px-4">
                <div className="text-center space-y-4 pt-16">
                    <h1 className="font-bold text-3xl text-[#2E2A47]">
                        Welcome Back!
                    </h1>
                    <p className="text-[#7E8CA0] text-base">
                        Log in or Create account to get back your account!
                    </p>
                </div>
                <div className="flex items-center justify-center mt-8">
                    <ClerkLoaded>
                        <SignIn
                            appearance={{
                                elements: {
                                    card: {
                                        boxShadow: "none",
                                        border: "1px solid #E5E7EB",
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
            <div className="h-full bg-slate-600 hidden lg:flex items-center justify-center">
                <Image src="/logo.svg" height={200} width={200} alt="Hero"/>
            </div>
        </div>
    )


}