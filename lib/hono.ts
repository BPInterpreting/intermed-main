import { hc } from 'hono/client'; //creates the client
import { AppType } from "@/app/api/[[...route]]/route"; //pass AppType as generics and URL is argument

//hc is the function that creates the client. AppType is passed as generics and URL is passed as argument
// export const client = hc<AppType>(process.env.NEXT_PUBLIC_URL!)
export const client = hc<AppType>(process.env.NEXT_PUBLIC_URL!, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, credentials: 'include' })
})
