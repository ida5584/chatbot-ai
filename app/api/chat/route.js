import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const systemPrompt = `You are the customer support chatbot for HeadstarterAI, a platform offering AI-powered interviews for software engineering jobs. Assist users by:
1) Helping with account setup and management,
2) Guiding interview preparation and interpreting feedback,
3) Providing technical support and troubleshooting,
4) Offering coding assistance and resources,
5) Managing billing and subscriptions, and
6) Answering general inquiries about the platform.
Ensure responses are clear, concise, and supportive.`;

const bedrock = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// export async function POST(req) {
//     const data = await req.json();

//     let messages = data.map(msg => ({
//         role: msg.role === 'user' ? 'user' : 'assistant',
//         content: msg.content
//     }));

//     if (messages.length > 0 && messages[0].role === 'user') {
//         messages[0].content = `${systemPrompt}\n\nUser's message: ${messages[0].content}`;
//     } else {
//         messages.unshift({
//             role: 'user',
//             content: systemPrompt
//         });
//     }

//     const params = {
//         modelId: "anthropic.claude-3-haiku-20240307-v1:0",
//         contentType: "application/json",
//         accept: "application/json",
//         body: JSON.stringify({
//             anthropic_version: "bedrock-2023-05-31",
//             max_tokens: 1000,
//             messages: messages,
//         })
//     };

//     const command = new InvokeModelCommand(params);

//     try {
//         const response = await bedrock.send(command);
//         const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
//         return NextResponse.json({ content: responseBody.content[0].text });
//     } catch (error) {
//         console.error('Error in Bedrock API call:', error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }


export async function POST(req) {
    const data = await req.json();

    let messages = data.map(msg => ({
        role: msg.role === 'user' ? 'Human' : 'Assistant',
        content: msg.content
    }));

    let prompt = `${systemPrompt}\n\n`;
    prompt += messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    prompt += '\nAssistant: ';

    const params = {
        modelId: "mistral.mistral-7b-instruct-v0:2",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            top_k: 50,
            stop: ["Human:", "Assistant:"]
        })
    };

    const command = new InvokeModelCommand(params);

    try {
        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        let generatedText = responseBody.outputs[0].text.trim();
        
        generatedText = generatedText.replace(/(\n(Human|Assistant):.*$)/s, '');

        return NextResponse.json({ content: generatedText });
    } catch (error) {
        console.error('Error in Bedrock API call:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}