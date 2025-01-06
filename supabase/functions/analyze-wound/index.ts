import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const openAiSystemPrompt = `You are a wound care analysis assistant. Analyze the provided wound image and provide evidence-based care recommendations. Focus on:
1. Wound characteristics
2. Cleaning and dressing recommendations
3. Monitoring instructions
4. Warning signs to watch for

Keep responses clear, concise, and focused on practical care steps.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image_base64 } = await req.json()
    
    if (!image_base64) {
      throw new Error('No image provided')
    }

    // Call OpenAI API for image analysis
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: openAiSystemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this wound image and provide care recommendations."
              },
              {
                type: "image_url",
                image_url: {
                  url: image_base64
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    })

    const result = await openAiResponse.json()
    
    if (!openAiResponse.ok) {
      throw new Error(result.error?.message || 'OpenAI API error')
    }

    return new Response(
      JSON.stringify({ analysis: result.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})