"use client"
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  // const {update , data , status} = useSession()
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white">
      {/* <p>LoggedIn as {data?.user?.name}</p> */}
      <button className="px-5 py-2 w-auto bg-indigo-500 text-white rounded-md" onClick={()=>signOut({'callbackUrl' : '/auth/login'})}>Signout</button>
    </div>
  );
}
