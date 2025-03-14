"use client"

import { GiHamburgerMenu } from 'react-icons/gi';
import { FiPlus } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Chat } from '@/types/next';


export default function LeftSidebar({
    children,
}: {
    children: React.ReactNode
}) {
    const [chats, setChats] = useState<Array<Chat>>([])
    const p = useParams()
    const { conversationId } = p;
    const router = useRouter()
    useEffect(() => {
        const cookies = document.cookie.split(';')
        let access_token = cookies.find(cookie => cookie.includes('access_token'))?.split('=')[1]
        const getAccessToken = async () => {
            if (!access_token) {
                const response = await fetch("/api/auth/refresh", {
                    credentials: "include"
                })
                const data = await response.json()
                access_token = data.accessToken;
            }
        }
        getAccessToken()
        if (access_token)
            fetchAllConversations(access_token)
    }, [conversationId])

    const fetchAllConversations = async (at: string) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/get_conversations", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${at}`
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
        <div className='h-screen w-full flex bg-white text-black '>
            <div className="w-[360px] shadow-xl h-full px-3 flex flex-col gap-4 z-10">
                <div className='w-full h-14 flex items-center gap-3'>
                    <div className='px-4 flex items-center gap-3'>
                        <GiHamburgerMenu className='h-6 w-6' />
                        <p className='text-2xl'>FM AI</p>
                    </div>
                </div>
                <div className=''>
                    <Link href={'/chat'} className='w-fit bg-[#DBE9FE] px-4 py-2 rounded-full text-black flex items-center gap-1'>
                        <FiPlus className='h-5 w-5' />
                        <p>New Chat</p>
                    </Link>
                </div>
                <div className='flex flex-col gap-2 overflow-scroll'>
                    <h6 className='font-bold mb-2 px-3'>All Chats</h6>
                    <div className='lex-1 flex flex-col gap-3 mb-20'>
                    {
                        chats && chats.map((chat, index) => {
                            return (
                                <button onClick={()=>{router.push(`/chat/${chat.conversation_id}`)}} disabled={chat.conversation_id == conversationId} key={chat.conversation_id} className={`rounded-full h-10 flex items-center px-4 ${conversationId == chat.conversation_id ? "bg-[#EFF6FF]" : "cursor-pointer"}`}>Chat {index + 1}</button>
                            )
                        })
                    }
                    </div>
                </div>
            </div>
            {children}
        </div>
    )
}