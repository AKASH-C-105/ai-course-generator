// app/api/chapters/route.ts
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { Chapters } from "@/configs/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId parameter" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(Chapters)
      .where(eq(Chapters.courseid, courseId))
      .orderBy(asc(Chapters.chapterId));

    return NextResponse.json({ chapters: result });
  } catch (err: any) {
    console.error("Failed to fetch chapters:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
