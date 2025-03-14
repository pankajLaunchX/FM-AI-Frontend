import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";

const authOptions: NextAuthOptions = {
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
            if (user) {
                token.name = user.name;
                token.email = user.email;
            }

            console.log(token)

            const first_name = token.name?.split(" ")[0];
            const last_name = token.name?.split(" ")[1];
            const email = token.email;

            const cookieStore = await cookies();

            if (!cookieStore.get("refresh_token") && first_name && last_name && email) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate_tokens`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            first_name,
                            last_name,
                            email_id: email
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();

                        cookieStore.set("access_token", data.access_token, {
                            maxAge: 60 * 15,
                            path: '/',
                            secure: true,
                        });

                        cookieStore.set("refresh_token", data.refresh_token, {
                            maxAge: 60 * 60 * 24 * 7, // 7 days
                            httpOnly: true,
                            path: '/',
                            secure: true,
                        });

                        return token;
                    } else {
                        throw new Error("Failed to generate tokens");
                    }
                } catch (error) {
                    console.error("Token generation error:", error);
                }
            }

            if (account) {
                token.accessToken = account.access_token;
            }

            return token;
        },
        async session({ session}) {
            // session.accessToken = token.accessToken;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
