import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phoneNumberString: string) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return null;
}

//used to trim the address from the nominatim incoming data for the client
export function trimAddress(fullAddress: string): string {
  const parts = fullAddress.split(',').map(s => s.trim());
  // Combine house number and street name with a space.
  const streetAddress = [parts[0], parts[1]].filter(Boolean).join(' ');
  const city = parts[2] || "";
  const state = parts[4] || "";
  const zip = parts[5] || "";
  return [streetAddress, city, state, zip].filter(Boolean).join(', ');
}



