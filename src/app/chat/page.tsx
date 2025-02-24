"use client"

import { Message } from '@/types/next';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Image from 'next/image';
import { IoPersonCircle, IoPulse, IoSend } from "react-icons/io5";
import { GiHamburgerMenu } from 'react-icons/gi';
import { FiPlus } from 'react-icons/fi';

const conversation: Message[] = [
    {
        message: "Hey there! I've been trying to improve my JavaScript skills, and I have some questions about arrays.",
        sender: "user"
    },
    {
        message: "Of course! Arrays are a fundamental part of JavaScript. I'd be happy to help. What specifically are you struggling with?",
        sender: "bot"
    },
    {
        message: "Well, I understand the basics, like how to create an array and loop through it. But I'm not sure about the best way to add or remove elements efficiently.",
        sender: "user"
    },
    {
        message: "That's a great question! If you need to add elements to the end of an array, `push()` is the best choice. To remove from the end, you can use `pop()`. But if you need to add or remove elements from the beginning, `unshift()` and `shift()` can be used, though they are less efficient because they shift all other elements.",
        sender: "bot"
    },
    {
        message: "Oh, I see! So using `shift()` and `unshift()` is slower because it affects the indexes of all elements?",
        sender: "user"
    },
    {
        message: "Exactly! Since JavaScript arrays are zero-based, every time you modify the start of an array, all elements need to be re-indexed. That’s why `push()` and `pop()` are generally preferred when working with large datasets.",
        sender: "bot"
    },
    {
        message: "Got it! That makes a lot of sense. What about inserting or removing elements from the middle of an array?",
        sender: "user"
    },
    {
        message: "For that, you can use `splice()`. It allows you to remove or insert elements at a specific index. For example, `array.splice(2, 1)` removes one element at index 2, while `array.splice(2, 0, 'newItem')` inserts 'newItem' at index 2 without removing anything.",
        sender: "bot"
    },
    {
        message: "That's really useful! I’ll try experimenting with `splice()` to understand it better. Thanks for explaining!",
        sender: "user"
    },
    {
        message: "You're very welcome! Hands-on practice is the best way to solidify your understanding. Let me know if you run into any issues!",
        sender: "bot"
    }
];





// let socket: SocketIOClient.Socket
export default function ChatPage(): React.ReactElement {
    const [messages, setMessages] = useState<Message[]>()
    const [inputMessage, setInputMessage] = useState<Message>()

    const ENDPOINT = process.env.CHAT_API

    // useEffect(() => {
    //     socketInitializer()
    // })

    // async function socketInitializer() {
    //     await fetch('api/socketio')
    //     socket = io(undefined, {
    //         path: '/api/socketio'
    //     })
    //     socket.on('connect', () => {
    //         console.log('Connected to Socket.IO server')
    //     })

    //     socket.on('chat message', (msg) => {
    //         setMessages((prevMessages: Message[]) => [...prevMessages, msg])
    //     })
    // }

    const sendMessage = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        // if (inputMessage?.message.trim() && socket) {
        //     socket.emit('chat message', inputMessage)
        //     if (inputMessage) setMessages((prevMessages: Message[]) => [...prevMessages, inputMessage])
        //     setInputMessage({ message: "", sender: "" })
        // }
        await fetch('/api/dummy', {
            method: 'GET',
        })
            .then(res => res.json())
            .then(data => {
                setMessages(data)
            })
    }

    const handleInputMessage = (message: string) => {
        const inputMessage: Message = {
            'message': message,
            'sender': 'user'
        }
    }

    return (
        <div className='w-full h-screen flex bg-white text-black'>
            {/* Side bar */}
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
                    <div className='rounded-full bg-[#EFF6FF] font-medium h-10 flex items-center px-4 cursor-pointer'>Pharma</div>
                    <div className='rounded-md  h-10 flex items-center px-4 cursor-pointer'>Chat 2</div>
                    <div className='rounded-md  h-10 flex items-center px-4 cursor-pointer'>Chat 3</div>


                </div>
            </div>
            {/* Chat */}
            <div className=" w-full h-full ">
                <div className='w-full h-14 px-4 py-2 flex items-center justify-end gap-3'>
                    <IoPersonCircle className='h-10 w-10' />
                </div>
                <div className='w-full h-[90%] flex flex-col items-start justify-start'>
                    <div className=' overflow-y-scroll w-full pr-3 flex justify-center gap-4'>
                        <div className='w-3/4 flex flex-col gap-4'>
                            {messages && messages.map((message, index) => (
                                <div key={index} className={`w-full items-start flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                                    {message.sender == 'bot' &&
                                        <div className='border rounded-full h-fit p-1 mt-4'>

                                            <Image className='border' src="/fm-bot-logo.png" alt="globe" height={20} width={20} />
                                        </div>
                                    }
                                    <div className={`p-4 flex-1 rounded-2xl w-auto ${message.sender === 'user' && 'text-[#454545] max-w-[60%] bg-[#DBE9FE]'} text-black`}>
                                        <p>{message.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='w-full flex-1 flex flex-col items-center justify-center'>
                        {/* New chat */}
                        <div className='w-3/4 h-full flex justify-center items-center flex-col gap-4'>
                            {!messages && <h1 className='text-3xl'>What can I help you with today?</h1>}
                            <form onSubmit={sendMessage} className='flex flex-col w-full rounded-2xl shadow-xl  border-[1px] px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                                <input type='text' value={inputMessage?.message}
                                    onChange={(e) => handleInputMessage(e.target.value)}
                                    placeholder='Ask me anything'
                                    className="flex w-full rounded-md bg-transparent px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] placeholder:text-lg focus-visible:ring-0 focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                                </input>
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
        </div>
    )
}