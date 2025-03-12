"use client"

import { Message } from '@/types/next';
import React, { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { IoPersonCircle, IoPulse, IoSend } from "react-icons/io5";
import { GiHamburgerMenu } from 'react-icons/gi';
import { FiPlus } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { get } from 'http';
import { sign } from 'crypto';
import Link from 'next/link';

// let socket: SocketIOClient.Socket
export default function ChatPage(): React.ReactElement {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState<Message>()
    const [outputMessage, setOutputMessage] = useState<Message>(
        {
            message: "",
            message_type: "bot"
        }
    )
    const { data: session, status } = useSession()
    const router = useRouter()
    const [conversations, setConversations] = useState<Array<string>>([])
    const [refreshToken, setRefreshToken] = useState<string>("")
    const params = useParams();
    const { conversationId } = params;
    const [accessToken, setAccessToken] = useState<string>("")
    const [isStreaming, setIsStreaming] = useState<boolean>(false)
    // const [conversationId, setConversationId] = useState<string>("")
    // console.log(conversationId)

    useEffect(() => {
        const fetchConversation = async () => {
            const response = await fetch('/api/conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversation_id: conversationId })
            })

            const data = await response.json();
            const fetchedMessages = data.messages.map((message: any) => {
                if (message.message_type === 'user') {
                    return message
                }
                const cleanedMessage = message.message.replace(/https?:\/\/[^\s]+/g, '');
                const urls = message.message.match(/(https?:\/\/[^\s]+)/g);
                return {
                    ...message,
                    message: cleanedMessage,
                    links: urls
                }
            })
            setMessages(fetchedMessages)
        }

        fetchConversation()
    }, [isStreaming])

    useEffect(() => {
        const parsedOutputMessage = outputMessage.message.replace(/https?:\/\/[^\s]+/g, '');
        const parsedUrls = outputMessage.message.match(/(https?:\/\/[^\s]+)/g);
        outputMessage.message = parsedOutputMessage;
        if (parsedUrls) {
            outputMessage.links = parsedUrls;
        }
        setMessages((prev) => [...prev, outputMessage])
    }, [outputMessage])


    // const generateConversationId = async (access_token: string) => {
    //     try {
    //         const newConversationId = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + `/start_new_conversation`, {
    //             method: "GET",
    //             headers: {
    //                 "authorization": `Bearer ${access_token}`,
    //             }
    //         })

    //         if (!newConversationId.ok) {
    //             throw new Error(`Failed to get a response. Status : ${newConversationId.status}`)
    //         }

    //         const data = await newConversationId.json();
    //         console.log("Conversation Id ==> ", data.conversation_id)
    //         setConversationId(data.conversation_id)
    //         return { success: true, data: data.conversation_id }
    //     }
    //     catch (error) {
    //         console.log("Failed to generate conversation ID", error)
    //         return { success: false, data: error }
    //     }
    // }
    // const sendMessage = async (e: React.SyntheticEvent) => {
    //     e.preventDefault()
    //     const response = await fetch("/api/dummy");
    //     const data = await response.json();
    //     setMessages(data)
    // }

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
        // if (inputMessage?.message.trim() && socket) {
        //     socket.emit('chat message', inputMessage)
        //     if (inputMessage) setMessages((prevMessages: Message[]) => [...prevMessages, inputMessage])
        //     setInputMessage({ message: "", sender: "" })
        // }
        // await fetch('/api/dummy', {
        //     method: 'GET',
        // })
        //     .then(res => res.json())
        //     .then(data => {
        //         setMessages(data)
        //     })
        setOutputMessage({ message: "", message_type: "bot" });
        if (!inputMessage) return;
        if (access_token)
            // cid = await generateConversationId(access_token);
            setMessages((prev) => [...prev, inputMessage])
    
        if (access_token) {
            setMessages((prev) => [...prev, inputMessage])
            setIsStreaming(true)
            const eventSource = new EventSource(process.env.NEXT_PUBLIC_BACKEND_URL + `/send_message_sse?message=${encodeURIComponent(inputMessage.message)}&conversation_id=${conversationId}&access_token=${access_token}`)
            let msg = ""

            eventSource.onmessage = (event) => {
                // console.log(event.data)
                const newChunk = JSON.parse(event.data).response; // Parse JSON response
                msg += newChunk
                const urlMatch = newChunk.match(/https?:\/\/[^\s]+/);

                setOutputMessage((prev) => ({
                    ...prev,
                    message_type: "bot",
                    message: prev.message + " " + newChunk
                }))
                // setOutputMessage((prev) => ({
                //     ...prev,
                //     message_type: "bot",
                //     message: prev.message +  " " + newChunk
                // })
                // )
            };

            eventSource.onerror = () => {
                console.error("SSE Error");
                eventSource.close();
                setIsStreaming(false)
            };

            eventSource.addEventListener("end", () => {
                eventSource.close();
                setIsStreaming(false)
            });

            // Clear input field
            setInputMessage({ message: "", message_type: "user" });
            setOutputMessage({ message: "", message_type: "bot" });
        }
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

        <div className='w-full h-screen flex justify-center items-center bg-white text-black'>
            {status === 'loading' && <h1>Loading...</h1>}
            {status === 'authenticated' &&
                <>
                    {/* Side bar */}
                    {/* <div className="w-[360px] shadow-xl h-full px-3 flex flex-col gap-4">
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
                            <div className='rounded-full bg-[#EFF6FF] font-medium h-10 flex items-center px-4 cursor-pointer'>Pharma</div>
                            <div className='rounded-md  h-10 flex items-center px-4 cursor-pointer'>Chat 2</div>
                            <div className='rounded-md  h-10 flex items-center px-4 cursor-pointer'>Chat 3</div>


                        </div>
                    </div> */}
                    {/* Chat */}
                    <div className=" w-full h-full ">
                        <div className='w-full h-14 px-4 py-2 flex items-center justify-end gap-3'>
                            <button onClick={() => signOut({ callbackUrl: "/login" })} className='bg-[#DBE9FE] rounded-full p-1'>
                                <IoPersonCircle className='h-10 w-10' />
                            </button>
                        </div>
                        <div className='w-full h-[90%] flex flex-col items-start justify-start'>
                            <div className=' overflow-y-scroll w-full pr-3 flex justify-center gap-4'>
                                <div className='w-3/4 flex flex-col gap-4'>
                                    {messages && messages.map((message, index) => {
                                        if (message.message_type === 'system') {
                                            return;
                                        }
                                        return (
                                            <div key={index} className={`w-full items-start flex ${message.message_type === 'bot' ? 'justify-start' : 'justify-end'}`}>
                                                {message.message_type == 'bot' &&
                                                    <div className='border rounded-full h-fit p-1 mt-4'>
                                                        <Image className='border' src="/fm-bot-logo.png" alt="globe" height={20} width={20} />
                                                    </div>
                                                }
                                                <div className={`p-4 flex-1 rounded-2xl w-auto ${message.message_type === 'user' && 'text-[#454545] max-w-[60%] bg-[#DBE9FE]'} text-black`}>
                                                    <p className='whitespace-break-spaces'>{message.message}</p>
                                                    {message.links && message.links.length > 0 &&
                                                        <div className='my-5 flex flex-col gap-2'>
                                                            {message.links.map((link, ind) => {
                                                                return (<Link className='text-blue-600' href={link} key={ind}>
                                                                    {ind + 1 + ". "}{link.length > 100 ? `${link.slice(0, 70)}...` : link}
                                                                </Link>)
                                                            })}
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {/* the generating code */}
                                    {
                                        isStreaming &&
                                        <div className={`w-full items-start flex justify-start`}>
                                            <div className='border rounded-full h-fit p-1 mt-4'>
                                                <Image className='border' src="/fm-bot-logo.png" alt="globe" height={20} width={20} />
                                            </div>
                                            <div className={`p-4 flex-1 rounded-2xl w-auto text-black`}>
                                                {/* <p>{outputMessage.message}</p> */}
                                                Generating
                                            </div>
                                        </div>

                                    }
                                </div>
                            </div>
                            <div className='w-full flex-1 flex flex-col items-center justify-center'>
                                {/* New chat */}
                                <div className='w-3/4 h-full flex flex-col justify-end gap-4'>
                                    {!messages && <h1 className='text-3xl'>What can I help you with today?</h1>}
                                    <form onSubmit={sendMessage} className='justify-self-end self-end flex flex-col w-full rounded-2xl shadow-xl  border-[1px] px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                                        <textarea value={inputMessage?.message}
                                            onChange={(e) => handleInputMessage(e.target.value)}
                                            placeholder='Ask me anything...'
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
                </>}
        </div>
    )
}