"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RiBookOpenLine, RiFileList3Line, RiQuestionLine, RiArrowLeftSLine, RiArrowRightSLine, RiAwardLine, RiCheckboxCircleFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/_context/ThemeContext";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface ChapterContent {
  title: string;
  content: string;
  summary: string;
  quiz?: QuizQuestion[];
}

interface DBChapter {
  id: number;
  courseid: string;
  chapterId: number;
  content: ChapterContent;
  videoId: string;
}

interface CourseData {
  id: number;
  courseid: string;
  name: string;
  category: string;
  topic: string;
  level: string;
}

// Improved Markdown Parser with clean layouts, high-visibility syntax colors, and copying utility classes
function renderMarkdown(markdown: string) {
  if (!markdown) return "";
  
  // Fix literal escaped newlines that sometimes get passed through from JSON payloads
  markdown = markdown.replace(/\\n/g, '\n');
  
  // Clean up code block snippets first to capture them before escaping other content
  let codeBlocks: string[] = [];
  let placeholderMarkdown = markdown.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/g, (match, codeSnippet) => {
    const index = codeBlocks.length;
    codeBlocks.push(codeSnippet.trim());
    return `__CODE_BLOCK_PLACEHOLDER_${index}__`;
  });

  // Escape standard HTML tags for safety on the remaining text
  let html = placeholderMarkdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='font-bold text-gray-900 dark:text-gray-100'>$1</strong>")
    // Italic
    .replace(/\*([^*]+)\*/g, "<em class='italic'>$1</em>")
    // Headers
    .replace(/^### (.*$)/gim, "<h3 class='text-sm font-bold text-gray-800 dark:text-gray-200 mt-4 mb-1.5'>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2 class='text-base font-bold text-gray-800 dark:text-gray-200 mt-5 mb-2 border-b border-gray-150 dark:border-gray-800 pb-1.5'>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1 class='text-lg font-extrabold text-gray-900 dark:text-white mt-6 mb-3'>$1</h1>")
    // Inline code snippet
    .replace(/`([^`]+)`/g, "<code class='bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-mono text-xs border border-gray-200 dark:border-gray-700'>$1</code>")
    // Unordered list items
    .replace(/^\s*-\s+(.*$)/gim, "<li class='list-disc ml-5 my-1 text-gray-600 dark:text-gray-300 text-xs'>$1</li>")
    // Numbered list items
    .replace(/^\s*\d+\.\s+(.*$)/gim, "<li class='list-decimal ml-5 my-1 text-gray-600 dark:text-gray-300 text-xs'>$1</li>");

  // Paragraph spacing cleanup
  html = html
    .split('\n\n')
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("__CODE_BLOCK_") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol")
      ) {
        return trimmed;
      }
      return `<p class='my-2 leading-relaxed text-gray-600 dark:text-gray-300 text-xs'>${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  // Insert code blocks back into the HTML safely
  codeBlocks.forEach((codeSnippet, index) => {
    // Escape code tags inside snippet for safety in display
    const safeSnippetForDisplay = codeSnippet
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const base64Code = typeof window !== "undefined" ? btoa(unescape(encodeURIComponent(codeSnippet))) : "";
    const blockHtml = `
      <div class="relative my-4 group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div class="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-[10px] font-mono text-gray-500">
          <span>Code Snippet</span>
          <button 
            data-code-b64="${base64Code}"
            class="copy-btn hover:text-pink-600 dark:hover:text-pink-400 font-bold transition-colors uppercase tracking-wider cursor-pointer"
          >
            Copy
          </button>
        </div>
        <pre class="bg-gray-950 p-4 overflow-x-auto text-[11px] font-mono leading-relaxed"><code class="text-white dark:text-gray-100">${safeSnippetForDisplay}</code></pre>
      </div>
    `;
    html = html.replace(`__CODE_BLOCK_PLACEHOLDER_${index}__`, blockHtml);
  });
    
  return html;
}

export default function CoursePlayer({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [chapters, setChapters] = useState<DBChapter[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"notes" | "quiz">("notes");
  const [loading, setLoading] = useState<boolean>(true);

  // Quiz interactive state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  useEffect(() => {
    if (courseId) {
      loadPlayerData();
    }
  }, [courseId]);

  const { theme, toggleTheme } = useTheme();

  // Reset quiz states whenever active chapter changes
  useEffect(() => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setActiveTab("notes");
  }, [activeChapterIndex]);

  // Set up global event delegation listener to capture click events on 'copy-btn' buttons
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.classList.contains("copy-btn")) {
        const b64Data = target.getAttribute("data-code-b64");
        if (b64Data) {
          try {
            const rawCode = decodeURIComponent(escape(atob(b64Data)));
            navigator.clipboard.writeText(rawCode).then(() => {
              const originalText = target.innerHTML;
              target.innerHTML = "Copied!";
              target.style.color = "#10b981"; // Success green color
              setTimeout(() => {
                target.innerHTML = originalText;
                target.style.color = ""; // reset color
              }, 2000);
            });
          } catch (err) {
            console.error("Failed to copy text", err);
          }
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [activeChapterIndex, activeTab]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      // 1) Load course
      const courseRes = await fetch(`/api/course?courseId=${courseId}`);
      if (!courseRes.ok) throw new Error("Course not found");
      const courseData = await courseRes.json();
      setCourse(courseData.course);

      // 2) Load chapters
      const chaptersRes = await fetch(`/api/chapters?courseId=${courseId}`);
      const chaptersData = await chaptersRes.json();
      setChapters(chaptersData.chapters || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return; // Locked
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = (quizQuestions: QuizQuestion[]) => {
    if (quizSubmitted) return;

    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Image src="/loader.gif" width={120} height={120} alt="Loading player..." unoptimized />
        <p className="text-gray-500 mt-4 text-sm font-medium">Opening educational workspace...</p>
      </div>
    );
  }

  if (!course || chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800">Workspace Unavailable</h3>
        <p className="text-sm text-gray-500 mt-1">Please generate chapter material first.</p>
        <Link href={courseId ? `/course/${courseId}` : "/dashboard"} className="mt-4">
          <Button className="bg-black text-white hover:bg-gray-800">Return to Course Details</Button>
        </Link>
      </div>
    );
  }

  const activeChapter = chapters[activeChapterIndex];
  const quizQuestions = activeChapter?.content?.quiz || [];

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition-colors duration-200 ${theme === "dark" ? "dark bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-800"}`}>
      
      {/* LEFT SIDEBAR: Course Navigator */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 flex justify-between items-start gap-2">
          <div>
            <Link href={`/course/${courseId}`} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors block mb-1">
              ← Overview
            </Link>
            <h2 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight line-clamp-2">{course.name}</h2>
            <span className="inline-block mt-1.5 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
              {course.level}
            </span>
          </div>
          
          {/* Theme switcher toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all text-sm shrink-0 cursor-pointer"
            title="Toggle Dark Mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[40vh] md:max-h-none">
          {chapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              onClick={() => setActiveChapterIndex(idx)}
              className={`flex items-start gap-2.5 p-3 rounded-lg cursor-pointer border transition-all duration-150
                ${
                  activeChapterIndex === idx
                    ? "bg-gradient-to-r from-pink-50/80 to-orange-50/80 dark:from-pink-950/20 dark:to-orange-950/20 border-pink-200 dark:border-pink-900 shadow-3xs"
                    : "border-transparent bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              <div className={`w-5.5 h-5.5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5
                ${
                  activeChapterIndex === idx
                    ? "bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-bold truncate ${activeChapterIndex === idx ? "text-gray-905 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                  {chapter.content?.title || `Chapter ${idx + 1}`}
                </h4>
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">Lesson outline ready</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Active Lesson Player */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 transition-colors">
        
        {/* Content Viewer body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* YouTube Video Section */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
            {activeChapter.videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeChapter.videoId}?autoplay=0&rel=0`}
                title={activeChapter.content?.title || "Tutorial Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 dark:text-gray-500 bg-gray-950">
                <RiBookOpenLine className="text-3xl animate-bounce" />
                <span className="text-[10px] mt-2 font-medium">Video tutorial unavailable</span>
              </div>
            )}
          </div>

          {/* Chapter Details Tabs */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Tabs Header */}
            <div className="flex border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40">
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex items-center gap-1.5 px-5 py-3 text-[10px] font-bold tracking-wider uppercase border-b-2 transition-colors
                  ${
                    activeTab === "notes"
                      ? "border-pink-500 text-pink-600 dark:text-pink-400"
                      : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                  }`}
              >
                <RiFileList3Line className="text-base" /> Study Notes
              </button>
              
              {quizQuestions.length > 0 && (
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`flex items-center gap-1.5 px-5 py-3 text-[10px] font-bold tracking-wider uppercase border-b-2 transition-colors
                    ${
                      activeTab === "quiz"
                        ? "border-pink-500 text-pink-600 dark:text-pink-400"
                        : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                >
                  <RiQuestionLine className="text-base" /> Practice Quiz
                </button>
              )}
            </div>

            {/* Tab content area */}
            <div className="p-5 md:p-6">
              
              {/* Study Notes Tab */}
              {activeTab === "notes" && (
                <article className="prose max-w-none dark:prose-invert">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 border-b dark:border-gray-800 pb-1.5">
                    {activeChapter.content?.title}
                  </h3>
                  
                  {/* Markdown Notes */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(activeChapter.content?.content || "No notes generated."),
                    }}
                    className="space-y-3"
                  />
                  
                  {activeChapter.content?.summary && (
                    <div className="mt-6 bg-orange-50/55 dark:bg-orange-950/15 border border-orange-100 dark:border-orange-900/40 p-5 rounded-xl">
                      <h4 className="font-bold text-orange-850 dark:text-orange-300 text-xs mb-1">Chapter Summary</h4>
                      <p className="text-[11px] text-orange-705 dark:text-orange-200 leading-relaxed">
                        {activeChapter.content.summary}
                      </p>
                    </div>
                  )}
                </article>
              )}

              {/* Quiz Tab */}
              {activeTab === "quiz" && quizQuestions.length > 0 && (
                <div className="space-y-6">
                  <div className="border-b pb-2.5 border-gray-100 dark:border-gray-800">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Concept Review</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Check your knowledge on the concepts taught in this lesson.</p>
                  </div>

                  <div className="space-y-5">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-2">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                          {qIdx + 1}. {q.question}
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[qIdx] === optIdx;
                            const isCorrect = q.answer === optIdx;
                            
                            let optionStyle = "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300";
                            if (isSelected) {
                              optionStyle = "border-pink-300 dark:border-pink-900 bg-pink-50/40 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 font-semibold";
                            }
                            
                            if (quizSubmitted) {
                              if (isCorrect) {
                                optionStyle = "border-green-300 dark:border-green-900 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 font-bold";
                              } else if (isSelected && !isCorrect) {
                                optionStyle = "border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 font-bold";
                              } else {
                                optionStyle = "border-gray-105 dark:border-gray-850 bg-gray-50/30 dark:bg-gray-950/10 text-gray-400 dark:text-gray-500 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                className={`w-full text-left p-2.5 px-3.5 rounded-lg border text-xs transition-all duration-100 ${optionStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submission and Scoring Banner */}
                  <div className="pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {quizSubmitted ? (
                      <div className="flex items-center gap-3 bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/50 p-3.5 rounded-xl w-full">
                        <RiAwardLine className="text-pink-600 dark:text-pink-400 text-2xl shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-pink-900 dark:text-pink-200 text-xs">Review Completed</h4>
                          <p className="text-[10px] text-pink-700 dark:text-pink-400 mt-0.5">
                            You scored <span className="font-bold text-base text-pink-900 dark:text-pink-200">{quizScore}</span> out of {quizQuestions.length}!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleSubmitQuiz(quizQuestions)}
                        disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                        className="w-full sm:w-auto bg-black dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white hover:bg-gray-900 font-bold py-4 px-6 rounded-lg text-xs"
                      >
                        Submit Answers
                      </Button>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* BOTTOM NAV BAR */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3.5 px-6 flex justify-between items-center shrink-0">
          <Button
            onClick={() => setActiveChapterIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeChapterIndex === 0}
            variant="outline"
            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 text-[11px] px-4 py-2 rounded-lg"
          >
            <RiArrowLeftSLine className="text-base" /> Previous
          </Button>

          {activeChapterIndex < chapters.length - 1 ? (
            <Button
              onClick={() => setActiveChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1))}
              className="bg-black dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white hover:bg-gray-900 flex items-center gap-1 text-[11px] px-4 py-2 rounded-lg font-bold"
            >
              Next <RiArrowRightSLine className="text-base" />
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-95 font-bold shadow-sm hover:scale-102 transition-all px-5 py-2 rounded-lg text-[11px] flex items-center gap-1">
                <RiCheckboxCircleFill className="text-sm" /> Finish Course
              </Button>
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}
