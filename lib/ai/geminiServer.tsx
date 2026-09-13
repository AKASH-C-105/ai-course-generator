// lib/ai/geminiServer.ts
import { GoogleGenAI } from "@google/genai";

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Safe Gemini generator (streaming) for text output.
 * - Exponential backoff on 429/quota errors
 * - Transparent error reporting
 */
export async function generateFromGemini(
  prompt: string,
  opts: { model?: string; useThinkingConfig?: boolean; jsonMode?: boolean } = { model: "gemini-3.6-flash", useThinkingConfig: false }
) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set in process.env");

  const model = opts.model ?? "gemini-3.6-flash";
  const jsonMode = opts.jsonMode ?? false;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const maxAttempts = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxAttempts} using model=${model}`);

      const stream = await ai.models.generateContentStream({
        model,
        config: jsonMode ? { responseMimeType: "application/json" } : {},
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      let output = "";
      for await (const chunk of stream) {
        if (chunk?.text) output += chunk.text;
      }

      if (!output) {
        throw new Error("Empty output from model — no text returned");
      }

      console.log(`Generation successful with model=${model}, length:`, output.length);
      return output;
    } catch (err: any) {
      const msg = String(err?.message || err || "");
      lastError = err;
      console.error(`[geminiServer] Attempt ${attempt} FAILED for model=${model}:`, msg);

      if (
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("429") ||
        msg.toLowerCase().includes("quota")
      ) {
        const backoffMs = Math.min(60000, 1000 * Math.pow(2, attempt - 1));
        console.warn(`Quota/429 error. Backing off ${backoffMs}ms (attempt ${attempt}).`);
        await sleep(backoffMs);
        continue;
      }

      if (
        msg.includes("404") ||
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("not supported") ||
        msg.toLowerCase().includes("no longer available")
      ) {
        console.error(`[geminiServer] Model "${model}" is unavailable. Throwing immediately.`);
        throw new Error(JSON.stringify({ message: msg, model }));
      }

      if (attempt < maxAttempts) {
        const backoffMs = 600 * attempt;
        console.warn(`Transient error — retrying in ${backoffMs}ms (attempt ${attempt}).`);
        await sleep(backoffMs);
        continue;
      }

      throw new Error(JSON.stringify({ message: msg, model }));
    }
  }

  throw new Error(JSON.stringify({ message: lastError?.message || "Unknown error", model }));
}

/**
 * Generates structured JSON from Gemini using non-streaming generateContent
 * with a responseSchema — guarantees valid JSON output every time.
 * Use this for chapter content generation.
 */
export async function generateJsonFromGemini(
  prompt: string,
  schema: object,
  opts: { model?: string } = {}
): Promise<any> {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set in process.env");

  const model = opts.model ?? "gemini-3.6-flash";
  const modelsToTry = [model, "gemini-3.5-flash", "gemini-3.5-flash-lite"];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let lastError: any = null;

  for (const m of modelsToTry) {
    try {
      console.log(`[generateJsonFromGemini] Trying model: ${m}`);

      const response = await ai.models.generateContent({
        model: m,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text ?? "";
      if (!text) throw new Error("Empty response from model");

      // Non-streaming JSON mode guarantees valid JSON — just parse it
      const parsed = JSON.parse(text);
      console.log(`[generateJsonFromGemini] Success with model: ${m}`);
      return parsed;
    } catch (err: any) {
      const msg = String(err?.message || err || "");
      console.warn(`[generateJsonFromGemini] Model ${m} failed:`, msg);
      lastError = err;

      // Fast-fail on 404
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) continue;

      // Quota backoff
      if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        await sleep(2000);
        continue;
      }
    }
  }

  throw new Error(`All models failed. Last: ${lastError?.message || lastError}`);
}
