import { hc } from 'hono/client'; //creates the client
import { AppType } from "@/app/api/[[...route]]/route"; //pass AppType as generics and URL is argument

const baseUrl =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_URL || ''
    : window.location.origin;

const fetchWithAuth: typeof fetch = async (input, init = {}) => {
  const headers = new Headers(init?.headers || {});

  if (typeof window !== 'undefined') {
    const clerk = (window as typeof window & {
      Clerk?: { session?: { getToken: () => Promise<string | null> } };
    }).Clerk;

    const token = await clerk?.session?.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
};

// hc is the function that creates the client. AppType is passed as generics and URL is passed as argument.
export const client = hc<AppType>(baseUrl, { fetch: fetchWithAuth });
