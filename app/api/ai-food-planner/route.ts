import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Party Food Planner API
 * 
 * Generates age-appropriate, allergy-safe party food suggestions
 * based on time of day, child's age, and dietary restrictions
 */

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface FoodPlannerRequest {
    childAge: number;
    partyTime: string; // ISO datetime
    allergies: string[]; // e.g., ["nuts", "gluten", "dairy"]
    attendeeCount: number;
}

export async function POST(req: NextRequest) {
    try {
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

        // Build context-aware prompt
        const prompt = `Þú ert sérfræðingur í barnaafmælum og næringu. Þú átt að búa til matseðil fyrir ${childAge} ára barn.

UPPLÝSINGAR UM AFMÆLIÐ:
- Aldur barns: ${childAge} ára
- Tímasetning: ${partyDate.toLocaleString('is-IS')} (${hour}:00)
- Tegund máltíðar: ${mealType}
- Fjöldi barna: ${attendeeCount}
- Óþol/ofnæmi: ${allergies.length > 0 ? allergies.join(', ') : 'Ekkert skráð'}

LEIÐBEININGAR:
1. Búðu til matseðil sem passar fyrir ${mealType} fyrir ${childAge} ára barn
2. ALLUR matur verður að vera öruggur miðað við þessi óþol: ${allergies.join(', ')}
3. Sýndu aðeins mat sem ÖLL börn geta borðað
4. Taktu tillit til aldurs - ${childAge} ára börn éta öðruvísi en eldri/yngri
5. Svaraðu á ÍSLENSKU

SNIÐMÁT:
Gefðu svör á þessu formi:

**Ráðlagður matseðill:**
[3-5 réttir sem passa fyrir aldur og tíma]

**Innkauparlisti:**
[Nákvæm listi með magni fyrir ${attendeeCount} börn]

**Ábendingar:**
[2-3 practical tips um að elda/undirbúa]

**Áætlaður kostnaður:**
[Raunhæft verðmat í ISK]

Vertu practical, realistic og ALLTAF hafa öll óþol í huga.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const suggestion = response.content[0].type === 'text'
            ? response.content[0].text
            : '';

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

    } catch (error) {
        console.error('AI Food Planner Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Villa kom upp við að búa til matseðil'
            },
            { status: 500 }
        );
    }
}
