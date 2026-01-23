import type {Metadata} from "next";
import {Inter, Barlow} from "next/font/google";
import "./globals.css";
import {ClerkProvider} from "@clerk/nextjs";
import {QueryProvider} from "@/providers/query-provider";
import {Toaster} from "@/components/ui/sonner";
import {DialogProvider} from "@/providers/dialog-provider";
import {ThemeProvider} from "next-themes";
import {AblyClientProvider} from "@/providers/ably-provider";

const inter = Inter({ subsets: ["latin"] });
const barlow = Barlow({ 
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "InterpreFi - Interpreter Management System",
  description: "Streamline interpreter bookings for insurance companies with our comprehensive management platform",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ClerkProvider >
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} ${barlow.variable}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <QueryProvider>
              <AblyClientProvider>
                  <DialogProvider />
                  <Toaster position='top-center' richColors />
                  {children}
              </AblyClientProvider>
          </QueryProvider>
        </ThemeProvider>
        </body>
        </html>
      </ClerkProvider>
  );
}
