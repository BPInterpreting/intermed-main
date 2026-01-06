import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QrCode, Smartphone } from "lucide-react";

export default function InterpreterPortalPlaceholderPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Interpreter Portal</h1>
          <p className="text-muted-foreground">
            Interpreters use the InterpreFi mobile app. A QR code deep-link will live here.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mobile app access (coming soon)</CardTitle>
            <CardDescription>For now, use the buttons below to login or create an account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/40 p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-background border flex items-center justify-center">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">QR code placeholder</p>
                  <p className="text-sm text-muted-foreground">
                    We’ll replace this with a scannable QR code that opens the InterpreFi interpreter app.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/sign-in" className="w-full">
                <Button className="w-full" size="lg">
                  Interpreter Login
                </Button>
              </Link>
              <Link href="/sign-up" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  Interpreter Sign Up
                </Button>
              </Link>
            </div>

            <div className="text-sm text-muted-foreground">
              <Link href="/" className="underline underline-offset-4">
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}