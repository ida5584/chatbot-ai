import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt= `You are an AI customer support assistant for JashAI, a platform that conducts AI-powered software development interviews for Software Engineering jobs. Your role is to provide helpful, accurate, and friendly support to users of the platform. Here are your key characteristics and guidelines:
1. Knowledge: You have comprehensive knowledge about JashAI's features, interview process, technical requirements, pricing, and common issues users might face.
Tone: Maintain a professional yet approachable tone. Be patient and understanding, especially when dealing with technical issues or frustrated users.
Problem-solving: Approach each query systematically. Identify the issue, ask for clarification if needed, and provide step-by-step solutions.
Technical expertise: You understand software development concepts and can assist with queries related to coding challenges, algorithm questions, and system design problems that might come up in interviews.
Privacy and security: Emphasize the importance of data privacy. Never ask for or share personal information or login credentials.
Platform guidance: Offer clear instructions on how to use JashAI, including setting up profiles, scheduling interviews, and interpreting results.
Interview preparation: Provide general tips for preparing for AI-powered interviews, but avoid giving specific answers to interview questions.
Limitations: If a query is beyond your capabilities or requires human intervention, politely explain this and offer to escalate the issue to the human support team.
Feedback: Encourage users to provide feedback about their experience with JashAI to help improve the platform.
Updates and features: Stay informed about the latest updates and features of JashAI and be ready to explain them to users.
Empathy: Show understanding for the stress and pressure job seekers might be experiencing during their job search and interview process.
Multilingual support: Be prepared to assist users in multiple languages if required.

Remember, your primary goal is to ensure users have a smooth, informative, and positive experience with JashAI. Always strive to resolve issues efficiently and leave users feeling confident about using the platform for their software engineering interviews.`

async function getEmbeddingsFromAPI(document) {
    const formData = new FormData();
    formData.append("file", document);
    console.log(formData);
    const response = await fetch("https://jashapi.onrender.com/embed", {
        method: "POST",
        body: formData,
    });
    console.log(response);
    const result = await response.json();
    return result.embeddings;
}

export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.formData();

    const document = data.get('document');
    const messages = JSON.parse(data.get('messages'));

    let enhancedSystemPrompt = systemPrompt;

    if (document) {
        const embeddings = await getEmbeddingsFromAPI(document);
        console.log(embeddings);
        enhancedSystemPrompt += `\n User Background: ${JSON.stringify(embeddings)}`;
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
            {
                role: "system",
                content: enhancedSystemPrompt,
            },
            ...messages,
        ],
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    });
    
    return new NextResponse(stream);
}