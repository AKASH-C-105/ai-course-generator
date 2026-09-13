"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RiDeleteBin6Line, RiBookOpenLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Course {
  id: number;
  courseid: string;
  name: string;
  category: string;
  topic: string;
  level: string;
  language: string;
  courseOutput: any;
  createdby: string;
  username: string;
}

interface UserCourseListProps {
  initialCourses: Course[];
}

export default function UserCourseList({ initialCourses }: UserCourseListProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Map category to static public assets
  const getCategoryImage = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("program") || cat.includes("code") || cat.includes("dev")) {
      return "/programming-logo.jpg";
    }
    if (cat.includes("data science") || cat.includes("analytics")) {
      return "/Data-science-logo.jpg";
    }
    if (cat.includes("ai") || cat.includes("machine") || cat.includes("intelligence") || cat.includes("ml")) {
      return "/aiml-logo.jpg";
    }
    if (cat.includes("cyber") || cat.includes("security")) {
      return "/cybersecurity-logo.jpg";
    }
    if (cat.includes("music") || cat.includes("art")) {
      return "/Music-logo.jpg";
    }
    if (cat.includes("game") || cat.includes("gaming")) {
      return "/game-logo.jpg";
    }
    return "/aiml-logo.jpg"; // Default cover
  };

  const handleDelete = async (courseId: string) => {
    try {
      setDeletingId(courseId);
      const res = await fetch("/api/course/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.courseid !== courseId));
        // Simple page reload or router refresh can update the count in layout
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete course");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong while deleting");
    } finally {
      setDeletingId(null);
    }
  };

  const getParsedOutput = (courseOutput: any) => {
    if (typeof courseOutput === "string") {
      try {
        return JSON.parse(courseOutput);
      } catch (e) {
        return {};
      }
    }
    return courseOutput || {};
  };

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 shadow-xs transition-colors duration-200">
        <Image src="/ai-logo-only.png" width={80} height={80} alt="Empty icon" className="opacity-40 animate-pulse dark:brightness-200" />
        <h3 className="text-xl font-bold mt-4 text-gray-800 dark:text-white">No courses generated yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
          Click "+ Create Course" above to instantly generate your first personalized, AI-powered course outline.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Your Courses</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const parsedOutput = getParsedOutput(course.courseOutput);
          return (
            <div
              key={course.id}
              className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              {/* Header Cover Photo */}
              <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image
                  src={getCategoryImage(course.category)}
                  alt={course.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-xs">
                  {course.category}
                </div>
              </div>

              {/* Content Body */}
              <div className="flex flex-col flex-1 p-5">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {course.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Topic: {course.topic}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {course.level}
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {course.language}
                  </span>
                  <span className="bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {parsedOutput?.chapters?.length || 0} Chapters
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-850">
                  <Link href={`/course/${course.courseid}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs py-2 rounded-lg"
                    >
                      <RiBookOpenLine /> View Details
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === course.courseid}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 rounded-lg p-2 transition-colors shrink-0 cursor-pointer"
                      >
                        <RiDeleteBin6Line className="text-lg" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                          This will permanently delete "{course.name}" and all of its generated chapter contents. This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(course.courseid)}
                          className="bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
