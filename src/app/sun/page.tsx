"use client ";

import { Textarea } from "@/components/ui/textarea";
import Header from "../components/header";
import { useChat } from "@ai-sdk/react"
import dynamic from 'next/dynamic';

export default function Sun() {
    
    // const {
    //     messages,
    //     input,
    //     handleInputChange,
    //     handleSubmit,
    //     status,
    //     error,
    //     stop,
    //     reload,
    //     setMessages,
    // } = useChat({
    //     api: '/api/chat',
    //     onError: (error) => {
    //         console.error('Chat error:', error);
    //     },
    //     onFinish: (message, { usage, finishReason }) => {
    //         console.log('Message finished:', { usage, finishReason });
    //     },
    // });









    return (
        
        <div>
            <Header />
            <section className="container mx-auto pt-15 text-center flex flex-col items-center">
                <h1 className="text-3xl font-normal ">
                    riseee & shineeee virgo
                </h1>
                <p className="text-lg text-muted-foreground pt-3 font-light"> talk to meee </p>
                
                <div className="w-full gap-30 mx-auto flex flex-col">
                    <Textarea />
                </div>
            </section>

            
        </div>
        
    )

}
