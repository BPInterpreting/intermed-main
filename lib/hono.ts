import { hc } from 'hono/client'; //creates the client
import { AppType } from "@/app/api/[[...route]]/route"; //pass AppType as generics and URL is argument

const baseUrl =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_URL || ''
    : window.location.origin;

// hc is the function that creates the client. AppType is passed as generics and URL is passed as argument.
export const client = hc<AppType>(baseUrl);
