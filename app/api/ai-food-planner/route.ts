import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Party Food Planner API
 * 
 * Generates age-appropriate, allergy-safe party food suggestions
 * based on time of day, child's age, and dietary restrictions
 * 
 * Uses Google Gemini (cheaper and easier than Claude!)
 */

interface FoodPlannerRequest {
    childAge: number;
    partyTime: string; // ISO datetime
    allergies: string[]; // e.g., ["nuts", "gluten", "dairy"]
    attendeeCount: number;
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Missing GEMINI_API_KEY environment variable');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Gervigreind ekki virk (vantar API lykil). Vinsamlegast hafið samband við kerfisstjóra.'
                },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const body: FoodPlannerRequest = await req.json();
        const { childAge, partyTime, allergies, attendeeCount } = body;

        // Parse party time to get hour
        const partyDate = new Date(partyTime);
        const hour = partyDate.getHours();

        // Determine meal type based on time
        let mealType = '';
        if (hour >= 10 && hour < 13) {
            mealType = 'brunch/morgunmatur';
        } else if (hour >= 13 && hour < 17) {
            mealType = 'snakk og góðgæti';
        } else if (hour >= 17 && hour < 21) {
            mealType = 'kvöldmatur';
        } else {
            mealType = 'léttar veitingar';
        }

        // Build context-aware prompt with detailed safety guidelines
        const prompt = `Þú ert reynslumikill næringarfræðingur og sérfræðingur í barnaafmælum á Íslandi. Þú átt að búa til öruggann og hagnýtan matseðil.

UPPLÝSINGAR UM AFMÆLIÐ:
- Aldur barns: ${childAge} ára
- Tímasetning: ${partyDate.toLocaleString('is-IS')} (${hour}:00)
- Tegund máltíðar: ${mealType}
- Fjöldi barna: ${attendeeCount}
- Óþol/ofnæmi: ${allergies.length > 0 ? allergies.join(', ') : 'Ekkert skráð'}

MIKILVÆGAR ÖRYGGIS-LEIÐBEININGAR:
1. **CRÍTIKAL:** ALLUR matur verður að vera 100% öruggur fyrir þessi óþol: ${allergies.length > 0 ? allergies.join(', ') : 'engin'}
2. Ef óþol eru skráð, ALDREI stinga til mögulegum valkostum - aðeins fullkomlega öruggt
3. Láttu foreldra ALLTAF vita um krossmengun hættu (t.d. "gakktu úr skugga um að nota sér hnífapör")
4. Ef hnetuofnæmi: EKKERT hrútur, mandelur, peanut butter, Nutella, eða bakkelsi með hnetur
5. Ef glútenaofnæmi: Aðeins vottaðar glútenfrír vörur, aldrei "gæti innihaldið"

LEIÐBEININGAR UM MATSEÐIL:
1. Aldur skiptir máli:
   - 4-6 ára: Einföld finger food, litríkt, lítil brot
   - 7-9 ára: Variað úrval, smá "cool" factor
   - 10-12 ára: Sophistication, lengri molar
2. Tími skiptir máli:
   - 10-13: Brunch vibe (bollar, ávextir, kleinur)
   - 13-17: Snakk & sweets (nammi + healthy valkostir)
   - 17-21: Kvöldmatur (pizzusneiðar, pasta, etc)
3. Íslenskar aðstæður:
   - Notaðu íslenska heitið (ekki "cupcakes" heldur "muffins")
   - Verðlag áætlað fyrir Bónus/Krónu/Costco
   - Svara á íslensku

PRACTICAL RÁÐLEGGINGAR:
1. Gef NÁKVÆMT magn (ekki "nokkrir" heldur "500g")
2. Segðu NÁKVÆMLEGA hvaða vörumerki eru öruggar ef óþol
3. Gefðu tímaáætlun fyrir undirbúning
4. Komdu með 1-2 "back-up" hugmyndum

MÓTAÐU SVARIÐ SEM JSON:
Svarið þitt Á AÐEINS að vera JSON hlutur (engar markdown code blocks) með þessari strúktúr:
{
  "menu": [
    { "title": "Réttur", "description": "Lýsing", "isVegan": boolean, "isGlutenFree": boolean }
  ],
  "shoppingList": ["Vara 1", "Vara 2"],
  "preparationSteps": ["Skref 1", "Skref 2"],
  "safetyTips": ["Ábending 1"],
  "estimatedCost": "X.XXX kr."
}

Vertu ALLTAF öruggur, practical og raunhæfur.`;

        // Use Gemini 2.0 Flash (Hratt og öflugt)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        const suggestion = result.response.text();

        return NextResponse.json({
            success: true,
            mealType,
            suggestions: suggestion,
            metadata: {
                childAge,
                partyTime,
                allergies,
                attendeeCount,
            },
        });

    } catch (error: any) {
        console.error('AI Food Planner Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: `Villa: ${error.message || 'Villa kom upp við að búa til matseðil'}`
            },
            { status: 500 }
        );
    }
}
