// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const systemPrompt = `You are an AI customer support assistant for JashAI, a platform that conducts AI-powered software development interviews for Software Engineering jobs. Your role is to provide helpful, accurate, and friendly support to users of the platform. Here are your key characteristics and guidelines:
// // ... (rest of the prompt remains the same)
// `;

// async function getEmbeddingsFromAPI(document) {
//     const formData = new FormData();
//     formData.append("file", document);
//     console.log(formData);
//     const response = await fetch("https://jashapi.onrender.com/embed", {
//         method: "POST",
//         body: formData,
//     });
//     console.log(response);
//     const result = await response.json();
//     return result.embeddings;
// }

// export async function POST(req) {
//     const openai = new OpenAI();
//     const data = await req.formData();

//     const document = data.get('document');
//     const messages = JSON.parse(data.get('messages'));

//     let enhancedSystemPrompt = systemPrompt;

//     if (document) {
//         const embeddings = await getEmbeddingsFromAPI(document);
//         console.log(embeddings);
//         enhancedSystemPrompt += `\nBackground: ${JSON.stringify(embeddings)}`;
//     }

//     const completion = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         stream: true,
//         messages: [
//             {
//                 role: "system",
//                 content: enhancedSystemPrompt,
//             },
//             ...messages,
//         ],
//     });

//     const stream = new ReadableStream({
//         async start(controller) {
//             const encoder = new TextEncoder();
//             try {
//                 for await (const chunk of completion) {
//                     const content = chunk.choices[0]?.delta?.content;
//                     if (content) {
//                         const text = encoder.encode(content);
//                         controller.enqueue(text);
//                     }
//                 }
//             } catch (err) {
//                 controller.error(err);
//             } finally {
//                 controller.close();
//             }
//         },
//     });
    
//     return new NextResponse(stream);
// }