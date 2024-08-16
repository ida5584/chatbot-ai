'use client'
import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const ingredients = 'chicken, rice, broccoli';
  const skillLevel = 'beginner';
  const cuisine = 'asian';
  
  const [recipeName, setRecipeName] = useState('')
  const [recipeIngredients, setRecipeIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [cookingTips, setCookingTips] = useState('')

  const fetchRecipe = async() => {
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{role: "user", content: `Ingredients: ${ingredients}, Skill level: ${skillLevel}, Cuisine: ${cuisine}`}]), 
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let result = ''
    await reader.read().then(function processText({done, value}){
      if (done){
        try {
          const responseData = JSON.parse(result);
          setRecipeName(responseData.recipeName)
          setRecipeIngredients(responseData.ingredients.join('\n'))
          setInstructions(responseData.instructions.join('\n'))
          setCookingTips(responseData.cookingTips.join('\n'))
        } catch (error) {
          console.error('Error parsing JSON:', error)
        }
        return result
      }
      const text = decoder.decode(value || new Int8Array(), {stream:true})
      result += text
      return reader.read().then(processText)
    })
  }

  return (
    <Box 
      width="100vw"
      height="100vh"
      display='flex'
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Typography variant="h4" component="div" gutterBottom>
          Recipe Generator
        </Typography>
        <Button variant="contained" onClick={fetchRecipe}>Get Recipe</Button>
        {recipeName && (
          <Box mt={3}>
            <Typography variant="h5" component="div" gutterBottom>
              {recipeName}
            </Typography>
            <Typography variant="h6" component="div" gutterBottom>
              Ingredients
            </Typography>
            <ReactMarkdown>{recipeIngredients}</ReactMarkdown>
            <Typography variant="h6" component="div" gutterBottom>
              Instructions
            </Typography>
            <ReactMarkdown>{instructions}</ReactMarkdown>
            <Typography variant="h6" component="div" gutterBottom>
              Cooking Tips
            </Typography>
            <ReactMarkdown>{cookingTips}</ReactMarkdown>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
