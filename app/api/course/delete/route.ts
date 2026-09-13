// app/api/course/delete/route.ts
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseList, Chapters } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { courseId } = await request.json().catch(() => ({ courseId: null }));

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    console.log("Deleting course with ID:", courseId);

    // 1) Delete chapters content
    try {
      await db.delete(Chapters).where(eq(Chapters.courseid, courseId));
      console.log("Deleted chapters content for course:", courseId);
    } catch (err: any) {
      console.warn("Failed to delete chapters (might not exist yet):", err?.message || err);
    }

    // 2) Delete course metadata shell
    const deleteResult = await db.delete(CourseList).where(eq(CourseList.courseid, courseId)).returning();

    if (!deleteResult || deleteResult.length === 0) {
      return NextResponse.json({ error: "Course not found or already deleted" }, { status: 404 });
    }

    console.log("Successfully deleted course shell:", courseId);
    return NextResponse.json({ success: true, deleted: deleteResult[0] });
  } catch (err: any) {
    console.error("Fatal error deleting course:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
