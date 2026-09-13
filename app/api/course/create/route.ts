// app/api/course/create/route.ts
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseList, Chapters } from "@/configs/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { courseData, courseOutput, chapters } = body || {};

    if (!courseData || !courseOutput || !chapters) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const courseId = uuidv4();

    // 1) Save course overview
    const insertedCourse = await db.insert(CourseList).values({
      courseid: courseId,
      name: courseData.name || "Untitled Course",
      category: courseData.category || "General",
      topic: courseData.topic || "Unknown",
      level: courseData.level || "Beginner",
      language: courseData.language || "English",
      courseOutput: courseOutput,
      createdby: courseData.createdby || "anonymous",
      username: courseData.username || "anonymous",
      addVideo: courseData.addVideo !== false,
    }).returning();

    // 2) Save generated chapters
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      await db.insert(Chapters).values({
        courseid: courseId,
        chapterId: ch.chapterIndex,
        content: ch.content,
        videoId: ch.videoId || "",
      });
    }

    console.log(`[Course Creation] Complete course saved to database with ID: ${courseId}`);

    return NextResponse.json({ success: true, courseId, course: insertedCourse[0] });
  } catch (err: any) {
    console.error("API /api/course/create fatal error:", err);
    return NextResponse.json({ error: err?.message || "Unknown server error" }, { status: 500 });
  }
}
