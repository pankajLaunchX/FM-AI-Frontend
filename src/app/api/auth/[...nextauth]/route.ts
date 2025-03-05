import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            const { name, email } = token!;
            const first_name = name?.split(" ")[0]
            const last_name = name?.split(" ")[1]
            
            try {
            const res = await fetch(process.env.BACKEND_URL + "/generate_tokens", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: first_name,
                    last_name: last_name,
                    email_id: email
                })
            })

            // console.log("Response from backend", res)

            if (res.ok) {
                const data = await res.json()
                const cookieStore = await cookies()
                cookieStore.set("access_token", data.access_token, {
                    maxAge: 60 * 30,
                    httpOnly: true,
                    path: '/',
                })
                cookieStore.set("refresh_token", data.refresh_token,
                    {
                        maxAge: 60 * 60 * 24 * 30,
                        httpOnly: true,
                        path: '/',
                    }
                )
            } else {
                throw new Error("Failed to generate tokens")
            }
        } catch (error) {
            console.log(error)
        }

            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
