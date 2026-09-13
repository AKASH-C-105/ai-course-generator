import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/schema";
import { eq, desc } from "drizzle-orm";
import AddCourse from "./_components/AddCourse";
import UserCourseList from "./_components/UserCourseList";

export default async function Dashboard() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  let courses: any[] = [];

  if (email) {
    try {
      courses = await db
        .select()
        .from(CourseList)
        .where(eq(CourseList.createdby, email))
        .orderBy(desc(CourseList.id));
    } catch (e) {
      console.error("Failed to fetch user courses:", e);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-gray-900 dark:text-white">
      {/* Welcome Header & Action */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs transition-colors">
        <AddCourse />
      </div>
 
      {/* Grid List of User Courses */}
      <UserCourseList initialCourses={courses} />
    </div>
  );
}