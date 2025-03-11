import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value; // Get refresh token from cookies

    if (!accessToken) {
        const response = await fetch("/api/auth/refresh", {
            credentials: "include", // Allows cookies to be sent
        });
        const data = await response.json()
        const at = data.accessToken;

        return NextResponse.json({accessToken : at})
    }

    return NextResponse.json({ accessToken });

    //   // Call backend to refresh access token
    //   const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/refresh_token", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ "refresh_token": refreshToken }),
    //   });

    //   if (!response.ok) {
    //     return NextResponse.json({ error: "Failed to refresh token" }, { status: 403 });
    //   }

    //   const data = await response.json();
    //   const accessToken = data.access_token
    //   cookieStore.set("access_token",accessToken,{
    //     path : '/',
    //     maxAge : 15*60,
    //     httpOnly : true
    //   })

    //   return NextResponse.json({ accessToken });
}
