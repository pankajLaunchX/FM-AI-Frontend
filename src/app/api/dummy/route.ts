import { Message } from "@/types/next";



export async function GET() {
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

    return Response.json(conversation)
    
}