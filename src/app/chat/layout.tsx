"use client"

import { GiHamburgerMenu } from 'react-icons/gi';
import { FiPlus } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useAuthStore } from '../store/useAuthStore';
type Chat = {
    conversation_id: string
}

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { accessToken, refreshAccessToken } = useAuthStore();
    const [chats, setChats] = useState<Array<Chat>>([])

    // useEffect(() => {

    // }, [refreshAccessToken]);

    // useEffect(() => {
    //     const refreshTokens = async () => {
    //         const response = await fetch("/api/auth/refresh", {
    //             credentials : "include"
    //         })
    //         // console.log(await response.json())
    //     }
    //     refreshTokens()
    // }, [])

    useEffect(() => {
        // let at = "";
        // const cookies = document.cookie;
        
        // fetchAllConversations()
    }, [])

    const fetchAllConversations = async () => {
        const response = await fetch("/api/auth/refresh",{
            credentials : "include"
        })
        const data = await response.json()
        const accessToken = data.accessToken;
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/get_conversations", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${accessToken}`
                },

            })
            if (!response.ok) {
                throw new Error(`Could not fetch conversations. Status : ${response.status}`)
            }

            const data = await response.json()
            setChats(data);

        }
        catch (error) {
            console.log(error)
        }
    }


    return (
        <main className='h-screen w-full flex bg-white text-black'>
            <div className="w-[360px] shadow-xl h-full px-3 flex flex-col gap-4">
                <div className='w-full h-14 flex items-center gap-3'>
                    <div className='px-4 flex items-center gap-3'>
                        <GiHamburgerMenu className='h-6 w-6' />
                        <p className='text-2xl'>FM AI</p>
                    </div>
                </div>
                <div className=''>
                    <button className='bg-[#DBE9FE] px-4 py-2 rounded-full text-black flex items-center gap-1'>
                        <FiPlus className='h-5 w-5' />
                        <p>New Chat</p>
                    </button>
                </div>
                <div className='flex flex-col gap-2'>
                    <h6 className=' font-bold mb-2 px-3'>All Chats</h6>
                    {
                        chats && chats.map(chat => {
                            return (
                                <div key={chat.conversation_id} className='rounded-full bg-[#EFF6FF] font-medium h-10 flex items-center px-4 cursor-pointer'>{chat.conversation_id}</div>
                            )
                        })
                    }
                </div>
            </div>
            {children}
        </main>
    )
}