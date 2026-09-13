"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RiBookOpenLine, RiFolderOpenLine, RiLockPasswordLine, RiCheckboxCircleLine, RiSettings3Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useTheme } from "@/app/_context/ThemeContext";

interface ChapterOutline {
  chapterName?: string;
  chapter_name?: string;
  name?: string;
  "Chapter Name"?: string;
  about?: string;
  description?: string;
  duration?: string;
}

interface CourseData {
  id: number;
  courseid: string;
  name: string;
  category: string;
  topic: string;
  level: string;
  language: string;
  addVideo: boolean;
  courseOutput: {
    courseName?: string;
    description?: string;
    chapters?: ChapterOutline[];
  };
  createdby: string;
  username: string;
}

export default function CourseDetail({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();
  
  const { theme } = useTheme();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [chaptersGenerated, setChaptersGenerated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [genLoading, setGenLoading] = useState<boolean>(false);
  const [currentGenIndex, setCurrentGenIndex] = useState<number>(0);
  const [totalChapters, setTotalChapters] = useState<number>(0);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseRes = await fetch(`/api/course?courseId=${courseId}`);
      if (!courseRes.ok) throw new Error("Course not found");
      const courseData = await courseRes.json();
      setCourse(courseData.course);

      const chaptersRes = await fetch(`/api/chapters?courseId=${courseId}`);
      const chaptersData = await chaptersRes.json();
      
      const outlineChapters = courseData.course?.courseOutput?.chapters || [];
      setTotalChapters(outlineChapters.length);

      if (chaptersData.chapters && chaptersData.chapters.length >= outlineChapters.length && outlineChapters.length > 0) {
        setChaptersGenerated(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapters = async () => {
    if (!course || !course.courseOutput?.chapters) return;
    setGenLoading(true);
    setCurrentGenIndex(0);

    const outline = course.courseOutput.chapters;
    
    try {
      for (let i = 0; i < outline.length; i++) {
        setCurrentGenIndex(i + 1);
        const chapter = outline[i];
        
        const res = await fetch("/api/generate-chapter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.courseid,
            chapterIndex: i,
            chapterName:
              chapter.chapterName ||
              chapter.chapter_name ||
              chapter.name ||
              chapter["Chapter Name"] ||
              `Chapter ${i + 1}`,
            topic: course.topic,
            level: course.level,
            addVideo: course.addVideo !== false,
          }),
        });

        if (!res.ok) {
          let serverError = `Failed to generate chapter ${i + 1}`;
          try {
            const errData = await res.json();
            serverError = errData?.error || serverError;
          } catch (_) {}
          throw new Error(serverError);
        }
      }
      
      setChaptersGenerated(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong during generation. Please try again.");
    } finally {
      setGenLoading(false);
      loadCourseData();
    }
  };

  const getCategoryImage = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("program") || cat.includes("code") || cat.includes("dev")) return "/programming-logo.jpg";
    if (cat.includes("data science") || cat.includes("analytics")) return "/Data-science-logo.jpg";
    if (cat.includes("ai") || cat.includes("machine") || cat.includes("ml")) return "/aiml-logo.jpg";
    if (cat.includes("cyber") || cat.includes("security")) return "/cybersecurity-logo.jpg";
    if (cat.includes("music") || cat.includes("art")) return "/Music-logo.jpg";
    if (cat.includes("game") || cat.includes("gaming")) return "/game-logo.jpg";
    return "/aiml-logo.jpg";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Image src="/loader.gif" width={120} height={120} alt="Loading..." unoptimized />
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">Loading course workspace...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Course Not Found</h3>
        <Link href="/dashboard" className="mt-4">
          <Button className="bg-black dark:bg-white dark:text-black dark:hover:bg-gray-150 text-white hover:bg-gray-800">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const outline = course.courseOutput?.chapters || [];

  return (
    <div className={`min-h-screen transition-colors duration-200 py-12 px-6 lg:px-16 ${theme === "dark" ? "dark bg-gray-950 text-white" : "bg-gray-50 text-gray-800"}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb / Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium">
          ← Back to Dashboard
        </Link>

        {/* Course Header Banner */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row items-stretch transition-colors">
          <div className="relative w-full md:w-1/3 h-56 md:h-auto bg-gray-100 dark:bg-gray-850 min-h-[220px]">
            <Image
              src={getCategoryImage(course.category)}
              alt={course.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-pink-50 dark:bg-pink-950/45 text-pink-700 dark:text-pink-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="bg-blue-50 dark:bg-blue-950/45 text-blue-700 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  {course.level}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {course.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                {course.courseOutput?.description || "A custom synthesized educational study material covering key syllabus requirements."}
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 border-t pt-6 border-gray-100 dark:border-gray-850">
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mr-auto">
                <RiFolderOpenLine className="text-lg" /> Language: <span className="font-semibold text-gray-800 dark:text-gray-200">{course.language}</span>
              </div>
              {chaptersGenerated ? (
                <Link href={`/course/${course.courseid}/start`}>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-95 font-bold shadow-md hover:scale-102 transition-all px-8 py-6 rounded-xl text-sm">
                    Start Learning Course
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleGenerateChapters}
                  className="w-full sm:w-auto bg-black dark:bg-white dark:text-black dark:hover:bg-gray-150 text-white hover:bg-gray-900 font-bold px-8 py-6 rounded-xl text-sm hover:scale-102 transition-all"
                >
                  Generate Chapter Content
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Course Outline Syllabus */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm transition-colors">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <RiBookOpenLine /> Course Outline
          </h3>

          <div className="space-y-4">
            {outline.map((chapter, index) => (
              <div
                key={index}
                className="flex items-start justify-between border border-gray-150 dark:border-gray-800 p-5 rounded-2xl bg-gray-50 dark:bg-gray-950/40 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-2xs group"
              >
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-gray-850 dark:text-gray-205 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {chapter.chapterName || chapter.chapter_name || chapter.name || chapter["Chapter Name"] || `Chapter ${index + 1}`}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed pl-8">
                    {chapter.about}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0 justify-between h-full pt-1.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold mb-2">{chapter.duration}</span>
                  {chaptersGenerated ? (
                    <RiCheckboxCircleLine className="text-green-500 text-2xl" />
                  ) : (
                    <RiLockPasswordLine className="text-gray-400 dark:text-gray-500 text-xl" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sequential Generator Modal Dialog */}
      {genLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <Image src="/loader.gif" width={100} height={100} alt="Synthesizing..." unoptimized />
            
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Generating Course Materials</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs leading-relaxed">
                Gemini is researching and structuring chapter notes, embedded video recommendations, and review quizzes. Please don't close this tab.
              </p>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-450 px-1">
                <span>Processing chapters</span>
                <span>{currentGenIndex} / {totalChapters}</span>
              </div>
              <Progress value={(currentGenIndex / totalChapters) * 100} className="h-3" />
            </div>

            <div className="text-xs font-medium text-pink-600 bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 px-4 py-2 rounded-xl animate-pulse">
              {(() => {
                const ch = outline[Math.min(currentGenIndex, totalChapters - 1)];
                const name = ch?.chapterName || ch?.chapter_name || ch?.name || ch?.["Chapter Name"] || `Chapter ${currentGenIndex}`;
                return `Generating: "${name}"`;
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
