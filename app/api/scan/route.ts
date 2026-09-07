// app/api/scan/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the SDK. Next.js securely accesses this on the server.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { base64Image, mimeType } = await req.json();

    // Use Gemini 1.5 Flash for speed and multi-modal (vision) capabilities
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        // This is the magic setting that forces Gemini to return a clean JSON object
        responseMimeType: "application/json", 
      }
    });

    const prompt = `
      Analyze this receipt image and extract the data into this exact JSON structure:
      {
        "storeName": "Name of the store",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "items": [
          {
            "name": "Item name",
            "qty": 1,
            "unitPrice": 5.99,
            "isTaxed": true (if the item has tax applied, otherwise false)
          }
        ]
      }
      If you cannot find a date or time, make a best guess or return an empty string. 
      For unitPrice, return a number (e.g., 5.99), not a string.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text();
    return NextResponse.json(JSON.parse(text));
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to process receipt" }, { status: 500 });
  }
}