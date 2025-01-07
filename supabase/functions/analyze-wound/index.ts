import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const openAiSystemPrompt = `You are a wound care analysis assistant. Analyze the provided wound image and provide evidence-based care recommendations. Focus on:
1. Wound characteristics
2. Cleaning and dressing recommendations
3. Monitoring instructions
4. Warning signs to watch for

Keep responses clear, concise, and focused on practical care steps.`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image_base64 } = await req.json()
    
    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log("Calling OpenAI API...");
    
    // Call OpenAI API for image analysis
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
    });

    console.log("OpenAI API Status:", openAiResponse.status);
    
    const result = await openAiResponse.json();
    
    if (!openAiResponse.ok) {
      console.error("OpenAI API Error:", result);
      return new Response(
        JSON.stringify({ error: result.error?.message || 'OpenAI API error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("Analysis completed successfully");
    
    return new Response(
      JSON.stringify({ analysis: result.choices[0].message.content }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});