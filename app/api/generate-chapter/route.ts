// app/api/generate-chapter/route.ts
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { Chapters } from "@/configs/schema";
import { getYouTubeVideoId } from "@/lib/youtube";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { courseId, chapterIndex, chapterName, topic, level, addVideo } = body || {};

    if (!courseId || chapterIndex === undefined || !chapterName || !topic) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    console.log(`[Generate Chapter] Starting chapter index ${chapterIndex}: "${chapterName}" | addVideo=${addVideo}`);

    // 1) Fetch YouTube video ID only if user enabled it
    const searchTopic = `${topic} ${chapterName}`;
    const videoId = addVideo !== false ? await getYouTubeVideoId(searchTopic) : "";

    // 2) Generate detailed lesson text and quiz via Gemini
    const { generateJsonFromGemini } = await import("@/lib/ai/geminiServer");

    // responseSchema forces Gemini to output valid JSON every time
    const chapterSchema = {
      type: "object",
      properties: {
        title:   { type: "string" },
        content: { type: "string", description: "Markdown formatted tutorial content" },
        summary: { type: "string" },
        quiz: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              options:  { type: "array", items: { type: "string" } },
              answer:   { type: "number", description: "Index 0-3 of the correct option" },
            },
            required: ["question", "options", "answer"],
          },
        },
      },
      required: ["title", "content", "summary", "quiz"],
    };

    const prompt = `Generate detailed tutorial content for the chapter "${chapterName}" in the course topic "${topic}".
The difficulty level is ${level || "Intermediate"}. The response must be a JSON object matching the requested schema. Make sure the 'content' field is written in markdown format with clear headings, detailed explanations, bullet points, and code blocks with syntax highlighting if relevant. Write a comprehensive, step-by-step guide with plenty of technical detail. Include a brief summary and a quiz of 3 multiple-choice questions.
IMPORTANT: Do not double-escape newlines (like \\n) in your markdown string. Use standard JSON formatting.`;

    let parsedContent: any = null;
    try {
      parsedContent = await generateJsonFromGemini(prompt, chapterSchema);
      
      // Sanitize AI hallucinations (double-escaped newlines) before saving to the database
      if (parsedContent?.content) {
        parsedContent.content = parsedContent.content.replace(/\\n/g, '\n');
      }
      
      console.log(`[Generate Chapter] JSON generated successfully for: "${chapterName}"`);
    } catch (geminiError: any) {
      console.error("[Generate Chapter] All models failed:", geminiError?.message);
      throw new Error(`Chapter generation failed: ${geminiError?.message || geminiError}`);
    }

    // 3) Upsert/Save the chapter content to PostgreSQL
    // Check if chapter already exists to prevent duplicate insertion
    const existing = await db
      .select()
      .from(Chapters)
      .where(and(eq(Chapters.courseid, courseId), eq(Chapters.chapterId, chapterIndex)));

    let savedRecord = null;
    if (existing.length > 0) {
      // Update existing
      savedRecord = await db
        .update(Chapters)
        .set({
          content: parsedContent,
          videoId,
        })
        .where(and(eq(Chapters.courseid, courseId), eq(Chapters.chapterId, chapterIndex)))
        .returning();
      console.log(`Updated existing chapter index ${chapterIndex}`);
    } else {
      // Insert new record
      savedRecord = await db
        .insert(Chapters)
        .values({
          courseid: courseId,
          chapterId: chapterIndex,
          content: parsedContent,
          videoId,
        })
        .returning();
      console.log(`Inserted new chapter index ${chapterIndex}`);
    }

    return NextResponse.json({ success: true, chapter: savedRecord[0] });
  } catch (err: any) {
    console.error("Chapter generation API error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
