// app/api/generate/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const prompt = body?.prompt;

    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    console.log("/api/generate called - prompt length:", prompt.length);

    const { generateFromGemini } = await import("@/lib/ai/geminiServer");

    // Helper function to clean and parse JSON response
    const cleanAndParseJson = (text: string) => {
      let cleaned = text.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      return JSON.parse(cleaned.trim());
    };

    // Confirmed working models (tested July 2026)
    const modelsToTry = [
      "gemini-3.6-flash",      // Primary — latest, confirmed working
      "gemini-2.0-flash",      // Fallback — stable
      "gemini-2.0-flash-lite", // Fallback — lighter
    ];

    let lastError: any = null;
    const attemptDetails: any[] = [];

    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model}`);
        const result = await generateFromGemini(prompt, { model, useThinkingConfig: false });
        const parsedResult = cleanAndParseJson(result);
        return NextResponse.json({
          result: parsedResult,
          attempt: model,
        });
      } catch (err: any) {
        const errMsg = String(err?.message || err);
        console.warn(`Model ${model} failed:`, errMsg);
        attemptDetails.push({ attempt: model, error: errMsg });
        lastError = err;
      }
    }

    // All models failed
    return NextResponse.json(
      {
        error: "All generation attempts failed (see server logs).",
        details: attemptDetails,
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("API /api/generate fatal error:", err);
    return NextResponse.json({ error: err?.message || "Unknown server error", raw: String(err) }, { status: 500 });
  }
}
