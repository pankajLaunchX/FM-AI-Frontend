"use client"

import { Message } from '@/types/next';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { IoPersonCircle, IoSend } from "react-icons/io5";
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage(): React.ReactElement {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState<Message>(
        {
            message: "",
            message_type : "user"
        }
    )
    const [outputMessage, setOutputMessage] = useState<Message>(
        {
            message: "",
            message_type: "bot"
        }
    )
    const [isStreaming, setIsStreaming] = useState<boolean>(false)
    const { status } = useSession()

    const params = useParams();
    const { conversationId } = params;

    const query= useSearchParams()
    let message = query.get('message')
    useEffect(() => {
        if(message !== ""){
            const messageObj = {
                message: message as string,
                message_type: 'user'
            }
            setInputMessage(messageObj)
            sendMessage(messageObj)
        }
        message = ""
    },[message])
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
            const fetchedMessages = data.messages?.map((message: any) => {
                if (message.message_type === 'user') {
                    return message
                }
                const cleanedMessage = message.message.replace(/https?:\/\/[^\s]+/g, '');
                const urls = message.message.match(/(https?:\/\/[^\s]+)/g)?.map((url:string) => url.replace(/,$/, ''));

                
                console.log(urls)
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
        if(inputMessage?.message!=="") {
            setMessages((prev)=>[...prev, inputMessage])
        }
        const parsedOutputMessage = outputMessage.message.replace(/https?:\/\/[^\s]+/g, '');
        const parsedUrls = outputMessage.message.match(/(https?:\/\/[^\s]+)/g);
        outputMessage.message = parsedOutputMessage;
        if (parsedUrls) {
            outputMessage.links = parsedUrls;
        }
        setMessages((prev) => [...prev, outputMessage])

    }, [isStreaming])

    const sendMessage = async (message : Message) => {
        // e.preventDefault()
        const cookies = document.cookie.split(';')
        let access_token = cookies.find(cookie => cookie.includes('access_token'))?.split('=')[1]
        if (!access_token) {
            const response = await fetch("/api/auth/refresh", {
                credentials: "include"
            })
            const data = await response.json()
            access_token = data.accessToken;
        }
        setOutputMessage({ message: "", message_type: "bot" });

        console.log("on line 91")
        if (!message.message) return;
        console.log("on line 93")
        
        // setMessages((prev) => [...prev, message])

        setMessages((prev) => [...prev, message])
        if (access_token) {
            setIsStreaming(true)
            const eventSource = new EventSource(process.env.NEXT_PUBLIC_BACKEND_URL + `/send_message_sse?message=${encodeURIComponent(message.message)}&conversation_id=${conversationId}&access_token=${access_token}`)
            let msg = ""

            eventSource.onmessage = (event) => {
                // console.log(event.data)
                const newChunk = JSON.parse(event.data).response; // Parse JSON response
                msg += newChunk
                // const urlMatch = newChunk.match(/https?:\/\/[^\s]+/);

                setOutputMessage((prev) => ({
                    ...prev,
                    message_type: "bot",
                    message: prev.message + " " + newChunk
                }))
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

    }

    return (

        <div className='w-full h-screen flex justify-center items-center bg-white text-black'>
            {status === 'loading' && <h1>Loading...</h1>}
            {status === 'authenticated' &&
                <>
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
                                                                return (<Link className='text-blue-600' href={link} key={ind} target="_blank">
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
                                    <div  className='justify-self-end self-end flex flex-col w-full rounded-2xl shadow-xl  border-[1px] px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                                        <textarea value=""
                                            onChange={(e) => handleInputMessage(e.target.value)}
                                            placeholder='Ask me anything...'
                                            className="flex w-full rounded-md bg-transparent px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] placeholder:text-lg focus-visible:ring-0 focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                                        </textarea>
                                        <div className='w-full h-16 flex items-center justify-end px-3'>
                                            <button onClick={()=>{if(inputMessage) sendMessage(inputMessage)}} className='bg-[#223F97] text-white rounded-full h-10 px-3 py-1'>
                                                <IoSend />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>}
        </div>
    )
}