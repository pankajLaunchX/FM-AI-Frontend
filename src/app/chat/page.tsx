"use client"

import { Message } from '@/types/next';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { IoPersonCircle, IoSend } from "react-icons/io5";
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation'

// let socket: SocketIOClient.Socket
export default function ChatPage() {
    const [inputMessage, setInputMessage] = useState<Message>({
        message: "",
        message_type: "user"
    })
    
    // const [outputMessage, setOutputMessage] = useState<Message>({
    //     message: "",
    //     message_type: "bot"
    // })
    const [messages, setMessages] = useState<Message[]>([])
    // const [accessToken, setAccessToken] = useState<string>("")
    const { status } = useSession()
    // const [conversationId, setConversationId] = useState<string>("")
    const router = useRouter()
    // const [conversations, setConversations] = useState<Array<string>>([])
    // const [refreshToken, setRefreshToken] = useState<string>("")
    // const { refreshAccessToken, accessToken } = useAuthStore();
    // const [isStreaming, setIsStreaming] = useState<boolean>(false)


    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login')
        }
    }, [status])

    // useEffect(() => {
    //     if (outputMessage.message)
    //         setMessages(prev => ([...prev, outputMessage]))
    // }, [isStreaming])

    const generateConversationId = async (access_token: string) => {
        try {
            const newConversationId = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + `/start_new_conversation`, {
                method: "GET",
                headers: {
                    "authorization": `Bearer ${access_token}`,
                }
            })

            if (!newConversationId.ok) {
                throw new Error(`Failed to get a response. Status : ${newConversationId.status}`)
            }

            const data = await newConversationId.json();
            console.log("Conversation Id ==> ", data.conversation_id)
            // setConversationId(data.conversation_id)
            return { success: true, data: data.conversation_id }
        }
        catch (error) {
            console.log("Failed to generate conversation ID", error)
            return { success: false, data: error }
        }
    }

    const sendMessage = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        const cookies = document.cookie.split(';')
        let access_token = cookies.find(cookie => cookie.includes('access_token'))?.split('=')[1]
        if (!access_token) {
            const response = await fetch("/api/auth/refresh", {
                credentials: "include"
            })
            const data = await response.json()
            access_token = data.accessToken;
        }
        // setOutputMessage({ message: "", message_type: "bot" });
        if (!inputMessage) return;
        let cid ;
        if (access_token)
            cid = await generateConversationId(access_token);
        setMessages((prev) => [...prev, inputMessage])
        if (inputMessage?.message)
            router.push(`/chat/${cid?.data}?message=${encodeURIComponent(inputMessage?.message)}`)
        // const eventSource = new EventSource(process.env.NEXT_PUBLIC_BACKEND_URL + `/send_message_sse?message=${encodeURIComponent(inputMessage.message)}&conversation_id=${cid?.data}&access_token=${access_token}`)
        // let msg = ""

        // eventSource.onmessage = (event) => {
        //     // console.log(event.data)
        //     const newChunk = JSON.parse(event.data).response; // Parse JSON response
        //     msg += newChunk
        //     const urlMatch = newChunk.match(/https?:\/\/[^\s]+/);
        //     if (urlMatch) {
        //         const fullUrl = urlMatch[0];

        //         setOutputMessage((prev) => ({
        //             ...prev,
        //             links: [...(prev.links ?? []), fullUrl]
        //         }))

        //     } else {
        //         setOutputMessage((prev) => ({
        //             ...prev,
        //             message_type: "bot",
        //             message: prev.message + " " + newChunk
        //         }))
        //     }
        // };

        // if (msg.includes("Sources: ")) {
        //     const sources = msg.split("Sources: ")[1];
        //     console.log(sources.split(","))
        // }

        // eventSource.onerror = () => {
        //     console.error("SSE Error");
        //     eventSource.close();
        //     setIsStreaming(false)
        // };

        // eventSource.addEventListener("end", () => {
        //     eventSource.close();
        //     setIsStreaming(false)
        // });

        // router.push(`/chat/${cid?.data}`)


        // // Clear input field
        // setInputMessage({ message: "", message_type: "user" });
        // setOutputMessage({ message: "", message_type: "bot" });

    }

    const handleInputMessage = (message: string) => {
        const inputMessage: Message = {
            'message': message,
            'message_type': 'user'
        }
        setInputMessage(inputMessage);
        // setMessages(messages => [...messages, inputMessage])
    }

    return (

        <>
            {status === 'loading' && <h1>Loading...</h1>}
            {status === 'authenticated' &&
                <div className=" w-full h-full ">
                    <div className='w-full h-14 px-4 py-2 flex items-center justify-end gap-3'>
                        <button onClick={() => signOut({ callbackUrl: "/login" })} className='bg-[#DBE9FE] rounded-full p-1'>
                            <IoPersonCircle className='h-10 w-10' />
                        </button>
                    </div>
                    <div className='w-full h-[90%] flex flex-col items-start justify-start'>
                        <div className=' overflow-y-scroll w-full pr-3 flex justify-center gap-4'>
                            <div className='w-3/4 flex flex-col gap-4'>
                                {messages && messages.map((message, index) => (
                                    <div key={index} className={`w-full items-start flex ${message.message_type === 'bot' ? 'justify-start' : 'justify-end'}`}>

                                        {message.message_type == 'bot' &&
                                            <div className='border rounded-full h-fit p-1 mt-4'>

                                                <Image className='border' src="/fm-bot-logo.png" alt="globe" height={20} width={20} />
                                            </div>
                                        }
                                        <div className={`p-4 flex-1 rounded-2xl w-auto ${message.message_type === 'user' && 'text-[#454545] max-w-[60%] bg-[#DBE9FE]'} text-black`}>
                                            <p className='whitespace-break-spaces'>{message.message}</p>
                                            {message.links && message.links.length > 0 &&
                                                <div className='my-5'>
                                                    {message.links.map((link, ind) => {
                                                        return (<Link className='text-blue-600' href={link} key={ind}>
                                                            {ind + 1 + ". "}{link.length > 100 ? `${link.slice(0, 70)}...` : link}
                                                        </Link>)
                                                    })}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                ))}
                                {/* the generating code */}
                                {
                                    // <div className={`w-full items-start flex justify-start`}>
                                    //     <div className='border rounded-full h-fit p-1 mt-4'>
                                    //         <Image className='border' src="/fm-bot-logo.png" alt="globe" height={20} width={20} />
                                    //     </div>
                                    //     <div className={`p-4 flex-1 rounded-2xl w-auto text-black`}>
                                    //         {/* <p>{outputMessage.message}</p> */}
                                    //         Generating
                                    //     </div>
                                    // </div>
                                }
                            </div>
                        </div>
                        <div className='w-full flex-1 flex flex-col items-center justify-center'>
                            {/* New chat */}
                            <div className='w-3/4 h-full flex justify-center items-center flex-col gap-4'>
                                {messages.length == 0 && <h1 className='text-3xl'>What can I help you with today?</h1>}
                                <form onSubmit={sendMessage} className='flex flex-col w-full rounded-2xl shadow-xl  border-[1px] px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                                    <textarea value={inputMessage.message}
                                        onChange={(e) => handleInputMessage(e.target.value)}
                                        placeholder='Ask me anything'
                                        className="flex w-full rounded-md bg-transparent px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] placeholder:text-lg focus-visible:ring-0 focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                                    </textarea>
                                    <div className='w-full h-16 flex items-center justify-end px-3'>
                                        <button type='submit' className='bg-[#223F97] text-white rounded-full h-10 px-3 py-1'>
                                            <IoSend />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}