import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64 } = await req.json();
    
    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log the first 100 characters of the image to verify format
    console.log("Image base64 prefix:", image_base64.substring(0, 100));

    // Fetch guidelines from the public URL
    console.log("Fetching clinical guidelines...");
    let guidelines = "";
    try {
      const guidelinesResponse = await fetch('https://wounds.nextstepcare.com.au/guidelines.txt');
      if (guidelinesResponse.ok) {
        guidelines = await guidelinesResponse.text();
        console.log("Guidelines loaded successfully");
      } else {
        console.warn("Failed to load guidelines, using fallback analysis approach");
      }
    } catch (error) {
      console.warn("Error loading guidelines:", error);
    }

    // Fetch prompt from the public URL
    console.log("Fetching prompt...");
    let prompt = "";
    try {
      const promptResponse = await fetch('https://wounds.nextstepcare.com.au/prompt.txt');
      if (promptResponse.ok) {
        prompt = await promptResponse.text();
        console.log("Prompt loaded successfully");
      } else {
        console.warn("Failed to load prompt");
      }
    } catch (error) {
      console.warn("Error loading prompt:", error);
    }

    console.log("Preparing OpenAI API request...");
    
    // Ensure the image URL is properly formatted
    const imageUrl = image_base64.startsWith('data:') 
      ? image_base64 
      : `data:image/jpeg;base64,${image_base64}`;

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${prompt}\n\n${guidelines ? `Based on these clinical guidelines:\n\n${guidelines}` : ''}`
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ];

    console.log("Calling OpenAI API with image analysis request...");
    
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    console.log("OpenAI API Status:", openAiResponse.status);
    
    const result = await openAiResponse.json();
    
    if (!openAiResponse.ok) {
      console.error("OpenAI API Error:", result);
      throw new Error(result.error?.message || 'OpenAI API error');
    }

    if (!result.choices?.[0]?.message?.content) {
      console.error("Unexpected API response format:", result);
      throw new Error('Invalid response format from OpenAI API');
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