import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    const systemPrompt = `You are a helpful startup cost advisor. Help entrepreneurs understand business expenses like insurance, legal costs, accounting, software tools, marketing budgets, and employee benefits.

Current context:
- Business location: ${context?.location || 'Not specified'}
- Entity type: ${context?.entityType || 'Not specified'}  
- Team size: ${context?.teamSize || 0} employees
- Current monthly budget: $${context?.monthlyBudget || 0}

Provide concise, practical advice with specific cost ranges and actionable tips. Keep responses under 300 words and focus on helping them understand what they need and typical market rates.

Format your response with clear headings using ** for bold text. Include specific dollar amounts when helpful.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    const suggestedValueMatch = response?.match(/\$([0-9,]+)/);
    const suggestedValue = suggestedValueMatch ? 
      parseInt(suggestedValueMatch[1].replace(/,/g, '')) : null;
    
    const categories = ['insurance', 'legal', 'accounting', 'software', 'marketing', 'utilities', 'rent'];
    const category = categories.find(cat => message.toLowerCase().includes(cat));

    return NextResponse.json({
      text: response,
      suggestedValue,
      category
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    return NextResponse.json({
      text: "I can help explain startup costs like insurance, legal fees, accounting, software tools, and marketing budgets. What specific area would you like to know about?",
      suggestedValue: null,
      category: null
    });
  }
}
