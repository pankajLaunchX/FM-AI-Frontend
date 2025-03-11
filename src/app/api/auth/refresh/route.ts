import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refresh_token")?.value; // Get refresh token from cookies

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  // Call backend to refresh access token
  const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/refresh_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "refresh_token": refreshToken }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 403 });
  }

  const data = await response.json();
  const accessToken = data.access_token
  cookieStore.set("access_token",accessToken,{
    path : '/',
    maxAge : 15*60,
    httpOnly : false
  })

  return NextResponse.json({ accessToken });
}
