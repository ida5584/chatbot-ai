import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are the customer support chatbot for HeadstarterAI, a platform offering AI-powered interviews for software engineering jobs. Assist users by:
                        1) Helping with account setup and management,
                        2) Guiding interview preparation and interpreting feedback,
                        3) Providing technical support and troubleshooting,
                        4) Offering coding assistance and resources,
                        5) Managing billing and subscriptions, and
                        6) Answering general inquiries about the platform.
                        Ensure responses are clear, concise, and supportive.`

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system', 
                content: systemPrompt, 
            }, 
            ...data, 
        ], 
        model: "gpt-4o-mini",
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}
