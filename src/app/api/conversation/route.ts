import { cookies } from "next/headers";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { conversation_id } = await req.json();
    const cookieStore = await cookies();
    const at = cookieStore.get("access_token")?.value

    const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + `/load_conversation_history?conversation_id=${conversation_id}`, {
        method: "GET",
        headers: {
            "authorization": `Bearer ${at}`,
            "Content-Type": "application/json"
        }
    })

    if (!response.ok) {
        return NextResponse.json({ error: response.statusText }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json(data);
}