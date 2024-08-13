# Interview's AI Chatbot for SWE interviewing help
Software developer interview helper bot, which help YOU in specific even more since we accept your resume as an input and will give you answers dedicated to your needs to be able to land that job!

Project dedicated to learning integrations with AI models and using Node.JS, Open AI, AWS Bedrock, EC2, Render, .

## Current features
- Resume input which helps the bot be able help your work experience specific questions and any improvements you want to implement on your resume 
- Acts as a bot to help you prepare for SWE interviews
- Messages from the Model are encoded and decoded using TextEncoder and TextDecoder
- Keeps history as long as page isnt refreshed
- Screen is fixed size so that the scroll will only happen within the chat window
- The output will be in markdown, does have issues with code blocks with long lines since they dont wrap
- ~~Uses the gpt-4o-mini Open AI model - (Currently Cheapest)~~ Switched to [Gemma 2 9B since it is free found here](https://openrouter.ai/models/google/gemma-2-9b-it:free/api)

## Images for reference
![alt text](./Images/AI_chatbot.png)


## Other Talking points
- For the markdown format tried a two packages and researched other ways just within Material UI but wasnt successful
  - Ended up using [react-markdown](https://github.com/remarkjs/react-markdown)
    - This worked right out of the box bullet and number points still have issues which is why the Response for the AI are padded
  - Tried [mui-markdown](https://dev.to/hpouyanmehr/markdown-with-mui-formerly-material-ui-components-13n2)
    - This had a few font issues and formatting inconsistencies 
- We decided the benifits of using AWS bedrock for our use case wasnt valuable, but did get it working
- RAG system (embeddings) for our usecase was unnesscary amount of overhead, specifically resume input. We decided to add the resume directly as context to the system prompt


## Running locally
Steps to run this locally:
1. Check if you have Node.js by running  "node -version" in your terminal
2. Run "npm install" when the terminal is opened within this project/directory (/chatbot-using-ai)
3. Create a ".env.local" file in the cloned directory 
4. Within the ".env.local" file you will have to add your own API Key like this "OPENAI_API_KEY=abcd", which you can get from their website and it will need a balance of non zero. 
5. Run "npm run dev" and hope you have fun