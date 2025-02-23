import React from "react";
import Image from "next/image";

export default function LoginPage(): React.ReactElement {
  return (
    <div className="h-screen w-full flex">
      <div className="w-1/2 flex justify-center items-center bg-gradient-to-r from-[#041759] to-[#02081E]">
        Carousel
      </div>
      <div className="w-1/2 flex justify-center items-center bg-[#02081E]">
        <div className="w-3/4 flex flex-col justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl">Hi I'm <strong>FM AI</strong>,</h1>
            <h1 className="text-3xl">Your personal sales coach.</h1>
          </div>
          <button className="w-1/2 bg-[#223F97] text-white font-bold p-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full p-1">
                <Image src="/google.png" alt="Google Logo" width={24} height={24} />
              </div>
              <span className="w-full font-normal">Login with Google</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}