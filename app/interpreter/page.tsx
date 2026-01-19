import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Smartphone } from "lucide-react";

export default function InterpreterPortalPlaceholderPage() {
  const appStoreUrl = process.env.NEXT_PUBLIC_INTERPREFI_APP_STORE_URL ?? "";
  const qrCodeUrl = appStoreUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        appStoreUrl,
      )}`
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Interpreter Portal</h1>
          <p className="text-muted-foreground">
            Sign up and access your interpreter account through the InterpreFi mobile app.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started with the Mobile App</CardTitle>
            <CardDescription>
              Scan the QR code below with your phone to download and sign up for the InterpreFi interpreter app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Placeholder */}
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/40 p-8 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-48 w-48 rounded-lg bg-background border-2 border-muted flex items-center justify-center overflow-hidden">
                    {qrCodeUrl ? (
                      <img
                        alt="InterpreFi app store QR code"
                        className="h-full w-full object-contain"
                        src={qrCodeUrl}
                      />
                    ) : (
                      <QrCode className="h-24 w-24 text-muted-foreground/50" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {appStoreUrl ? "Scan to download" : "QR Code Placeholder"}
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-2 max-w-md">
                <p className="text-sm font-medium">
                  Scan this QR code with your phone camera
                </p>
                <p className="text-sm text-muted-foreground">
                  {appStoreUrl
                    ? "This will open the InterpreFi app in the App Store so you can download and sign up."
                    : "Add NEXT_PUBLIC_INTERPREFI_APP_STORE_URL to your environment to enable the App Store QR code."}
                </p>
                {appStoreUrl ? (
                  <Link href={appStoreUrl} className="text-sm underline underline-offset-4 hover:text-foreground">
                    Open the App Store
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <Link href="/" className="underline underline-offset-4 hover:text-foreground">
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
