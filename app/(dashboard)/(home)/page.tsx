import Image from "next/image";
import {UserButton} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className='flex flex-col gap-y-4'>

      main page
        <UserButton
            afterSignOutUrl='/'
        />

    </div>

  );
}
