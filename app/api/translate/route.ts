import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/**
 * Translation API - Secure Gemini Translation Service
 *
 * SECURITY:
 * - Rate limiting (20 requests/minute per IP)
 * - Input validation (max 5000 chars)
 * - Allowed languages whitelist
 */

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// Allowed target languages
const ALLOWED_LANGUAGES = ['is', 'en', 'pl', 'es', 'lt', 'Icelandic', 'English', 'Polish', 'Spanish', 'Lithuanian'];

// Max text length to translate
const MAX_TEXT_LENGTH = 5000;

export async function POST(request: Request) {
    // Rate limiting: 20 requests per minute per IP
    const clientIp = getClientIp(request);
    const limitResult = await rateLimit(`translate:${clientIp}`, 20, 60000);

    if (!limitResult.success) {
        return NextResponse.json({
            error: 'Too many requests',
            message: 'Þú hefur sent of margar þýðingarbeiðnir. Reyndu aftur eftir smá stund.',
            resetAt: limitResult.resetAt,
        }, {
            status: 429,
            headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': '20',
                'X-RateLimit-Remaining': '0',
            }
        });
    }

    if (!genAI) {
        return NextResponse.json({ error: "Translation service unavailable (Config Error)" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { text, targetLang } = body;

        // Input validation
        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: "Missing or invalid text" }, { status: 400 });
        }

        if (!targetLang || typeof targetLang !== 'string') {
            return NextResponse.json({ error: "Missing or invalid target language" }, { status: 400 });
        }

        // Length check
        if (text.length > MAX_TEXT_LENGTH) {
            return NextResponse.json({
                error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`
            }, { status: 400 });
        }

        // Language whitelist check
        if (!ALLOWED_LANGUAGES.some(lang => targetLang.toLowerCase().includes(lang.toLowerCase()))) {
            return NextResponse.json({
                error: "Unsupported target language"
            }, { status: 400 });
        }

        // Use standard Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are a professional translator.
        Translate the following text into ${targetLang}.
        Output ONLY the translation. Do not include quotes or explanations.

        Text: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const translatedText = response.text();

        return NextResponse.json({
            translation: translatedText.trim()
        }, {
            headers: {
                'X-RateLimit-Remaining': String(limitResult.remaining || 0),
            }
        });
    } catch (error) {
        logger.error("Translation API Error:", error);
        return NextResponse.json({ error: "Translation failed" }, { status: 500 });
    }
}
