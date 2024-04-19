import { hc } from 'hono/client'; //creates the client
import { AppType } from "@/app/api/[[...route]]/route"; //pass AppType as generics and URL is argument

//pass AppType as generics and URL is argument
export const client = hc<AppType>("http://localhost:3000")
