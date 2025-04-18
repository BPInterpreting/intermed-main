import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ClerkProvider} from "@clerk/nextjs";

import {QueryProvider} from "@/providers/query-provider";
import {Toaster} from "@/components/ui/sonner";
import {DialogProvider} from "@/providers/dialog-provider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ClerkProvider >
        <html lang="en">
        <body className={inter.className}>
        {/*<ThemeProvider attribute="class" defaultTheme="system" enableSystem>*/}
          <QueryProvider>
            <DialogProvider />
            <Toaster position='top-center' richColors />
            {children}
          </QueryProvider>
        {/*</ThemeProvider>*/}
        </body>
        </html>
      </ClerkProvider>
  );
}
