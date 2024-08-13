'use client'

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown'

import pdfToText from 'react-pdftotext'


export default function Home() {
  const [aiMessages, setAiMessages] = useState([{
    role: `assistant`,
    content: `Hi I'm the InterviewAI, a bot for conducting AI-powered software development interviews. How can I assist you today?`,
  }]);

  const [prompt, setPrompt] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  // const [ragPrompt, setRagPrompt] = useState('');

  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    if (resumeFile) {
      handleRAGSubmit();
    }
  }, [resumeFile]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  }

  const handleRAGSubmit = async () => {
    // Parses to into text
    if (!resumeFile) return;

    setIsUploading(true);
    setAiMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: 'Uploaded resume' },
      { role: 'assistant', content: '' },
    ]);

    await pdfToText(resumeFile)
    .then(text => {
      console.log("File as text:", text)
      setFileContent(text)
    })
    .catch(error => console.error("Failed to extract text from pdf"))

    setIsUploading(false);
    setResumeFile(null);
  }

  const handleChatSubmit = async () => {
    if (!prompt) return;

    setIsUploading(true);
    setAiMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: prompt },
      { role: 'assistant', content: '' },
    ]);

    const formData = new FormData();
    formData.append('document', fileContent);
    formData.append('messages', JSON.stringify( [
      ...aiMessages,
      { role: 'user', content: prompt }
    ]));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        body: formData,
      });
      console.log('x-ratelimit-reset-tokens: ',response.headers['x-ratelimit-remaining-tokens'])

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setAiMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedLastMessage = {
            ...lastMessage,
            content: lastMessage.content + text,
          };
          return [...prevMessages.slice(0, -1), updatedLastMessage];
        });
      }
    } catch (error) {
      console.error('Error headers:', error['headers'])
      console.error('Error:', error);
      setAiMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' },
      ]);
    } finally {
      setIsUploading(false);
      setPrompt('');
    }
  }

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="top">
      <Typography variant="h2">Interview AI for SWE</Typography>
      <Typography>Please upload your resume or enter your questions in the prompt box below:</Typography>
      
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Typography variant="h6">Resume:</Typography>
        <TextField 
          variant="standard" 
          type="file" 
          inputProps={{accept:"application/pdf"}} 
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </Stack>

      <Stack display="flex" flexDirection="column" maxHeight="700px" maxWidth="600px">
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%" maxWidth="590px" border="1px solid #000">
          {aiMessages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === "assistant" ? "flex-start" : "flex-end"} p={1}>
              <Box maxWidth="80%" bgcolor={message.role === "assistant" ? "#ededed" : "green"} color={message.role === "assistant" ? "#black" : "white"} borderRadius={5} p={1} paddingLeft={message.role === "assistant" ? 4 : 1}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>        
      </Stack>

      <Stack direction="row" width="600px" p={3} spacing={2}>
        <TextField 
          variant="outlined"  
          fullWidth 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isUploading}
        />
        <Button variant="contained" onClick={handleChatSubmit} disabled={isUploading}>
          {isUploading ? 'Processing...' : 'Submit'}
        </Button>
      </Stack>
    </Box>
  );
}