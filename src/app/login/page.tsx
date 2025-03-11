"use client"

import React from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage(): React.ReactElement {
  const [loginUrl, setLoginUrl] = React.useState<string>("")

  const { data: session } = useSession()

  if (session) {
    redirect("/chat")
  }

  // const handleLogin  = async ()  => {
  //   try {
  //     await fetch("https://app-dev-1002487456463.asia-south1.run.app/login",{
  //       method: 'GET'
  //     })
  //     .then((res)=>{
  //       if(res.status === 200){
  //         console.log("Login Successful")
  //         return res.json()
  //       } else {
  //         throw new Error("Login Failed")
  //       }
  //     }).then((data)=>{
  //       console.log(data)
  //       window.location = data.auth_url;
  //     })
  //     .catch((err)=>{
  //       console.error(err)
  //     }
  //     )
  //   } catch (error) {
  //     console.error("Login Failed,", error)
  //   }
  // }

  const handleSignIn = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "http://localhost:3000/chat" });
      console.log(result)
    } catch (error) {
      console.error("Sign In Failed,", error)
    }
  }

  return (
    <div className={styles.fullPage}>
      <div className={styles.carouselSide}>
        <div className="w-full h-full flex justify-center items-end bottom-0">
          <Image className="rounded-2xl" src="/login/wave.png" alt="FM wave" height={500} width={1000} />
        </div>
        {/* <div>
          Carousel
        </div> */}
      </div>
      <div className={styles.loginSide}>
        <div className="w-3/4 flex flex-col justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl">Hi I'm <strong>FM AI</strong>,</h1>
            <h1 className="text-3xl">Your personal sales coach.</h1>
          </div>
          <button onClick={handleSignIn} className="w-1/2 bg-[#223F97] text-white font-bold p-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full p-1">
                <Image src="/google.png" alt="Google Logo" width={24} height={24} />
              </div>
              <span className="w-full font-normal">Login with Google</span>
            </div>
          </button>
        </div>
        <div className="bottom-20 absolute p-4">
          <Image src="/fm-logo-blue.png" alt="FM AI Logo" width={150} height={50} />
        </div>
      </div>
    </div>
  );
}