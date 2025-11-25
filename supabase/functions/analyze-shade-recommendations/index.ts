import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skinAnalysis, searchQuery } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing shade recommendations for:', { skinAnalysis, searchQuery });

    const systemPrompt = `You are an expert makeup and skincare consultant specializing in Indian beauty brands. 
Analyze the user's face characteristics and provide personalized product shade recommendations based on their query.

Face Analysis Data:
- Skin Tone: ${skinAnalysis?.skinTone || 'Not detected'}
- Undertone: ${skinAnalysis?.undertone || 'Not detected'}
- Concerns: ${skinAnalysis?.concerns?.join(', ') || 'None'}

User is searching for: "${searchQuery}"

Provide 3-5 specific product recommendations from Indian brands (like Minimalist, Sugar Cosmetics, Lakme, Mamaearth, MyGlamm) that:
1. Match their skin tone and undertone perfectly
2. Address their concerns
3. Are relevant to their search query
4. Include specific shade names and why they suit this person

Return your response as a JSON array with this structure:
[
  {
    "productName": "Exact product name",
    "brand": "Brand name",
    "shade": "Specific shade name",
    "price": price in rupees (number),
    "whyItSuits": "2-3 sentence explanation of why this shade suits their skin tone/undertone/concerns",
    "category": "skincare or makeup",
    "type": "lipstick/foundation/blush/eyeshadow/serum/moisturizer/etc",
    "rgbColor": {
      "r": number (0-255),
      "g": number (0-255),
      "b": number (0-255)
    }
  }
]

IMPORTANT: For makeup products (lipstick, foundation, blush, eyeshadow), you MUST include accurate RGB color values that represent the actual shade. For skincare products, use neutral skin-tone colors.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Find me: ${searchQuery}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);
    
    // Parse the JSON response from AI
    let recommendations;
    try {
      // Try to extract JSON from markdown code blocks or plain text
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      recommendations = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI recommendations');
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-shade-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
