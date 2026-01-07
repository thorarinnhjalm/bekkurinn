import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

export async function POST(request: Request) {
    if (!genAI) {
        return NextResponse.json({ error: "Translation service unavailable (Config Error)" }, { status: 503 });
    }

    try {
        const { text, targetLang } = await request.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: "Missing text or target language" }, { status: 400 });
        }

        // Use standard Gemini model (gemini-pro is standard, gemini-1.5-flash is faster if available)
        // We'll stick to a safe default that usually works with standard keys
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are a professional translator. 
        Translate the following text into ${targetLang}. 
        Output ONLY the translation. Do not include quotes or explanations.
        
        Text: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const translatedText = response.text();

        return NextResponse.json({ translation: translatedText.trim() });
    } catch (error) {
        console.error("Translation API Error:", error);
        return NextResponse.json({ error: "Translation failed" }, { status: 500 });
    }
}
