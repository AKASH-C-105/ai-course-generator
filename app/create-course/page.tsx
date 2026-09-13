"use client";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { UserInputContext } from "@/app/_context/UserInputContext";
import SelectCategory from "./_components/SelectCategory";
import TopicDescription from "./_components/TopicDescription";
import SelectOption from "./_components/SelectOption";
import { Button } from "@/components/ui/button";
import { RiBook2Fill, RiChatNewLine, RiSettings3Line } from "react-icons/ri";
import LoadingDialog from "./_components/LoadingDialog";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/_context/ThemeContext";

export default function CreateCourseFlow() {
  const { user } = useUser();
  const router = useRouter();
  const { userCourseInput } = useContext(UserInputContext)!;
  const stepperOptions = [
    { id: 1, name: "Select Category", icon: <RiBook2Fill /> },
    { id: 2, name: "Topic & Description", icon: <RiChatNewLine /> },
    { id: 3, name: "Additional Options", icon: <RiSettings3Line /> },
  ];

  useEffect(() => {
    console.log("userCourseInput:", userCourseInput);
  }, [userCourseInput]);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canProceed = useMemo(() => {
    if (activeStep === 0) return !!userCourseInput?.category;
    if (activeStep === 1) return !!userCourseInput?.topic;
    if (activeStep === 2) {
      const keys = ["Level", "Duration", "Add Video", "No. of Chapters", "Language"];
      return keys.some((k) => !!userCourseInput?.[k]);
    }
    return false;
  }, [activeStep, userCourseInput]);

  const handleNext = () => {
    if (activeStep < stepperOptions.length - 1) setActiveStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (activeStep > 0) setActiveStep((s) => s - 1);
  };

  // Sequential generation status
  const [loadStatus, setLoadStatus] = useState<string>("Structuring course layout...");

  // Robust Generate function
  const GenerateCourseLayout = async () => {
    setError(null);
    setGenerated(null);

    if (loading) return;

    const BASIC_PROMPT =
      "Generate a course tutorial on following detail with field as Course name, description along with chapter name, about, duration: ";
    const USER_INPUT_PROMPT = `Category: ${userCourseInput?.category || "Not specified"}, Topic: ${
      userCourseInput?.topic || "Not specified"
    }, Additional description: ${userCourseInput?.description || "Not specified"}, Level: ${
      userCourseInput?.Level || "Not specified"
    }, Duration: ${userCourseInput?.Duration || "Not specified"},No. of Chapters: ${userCourseInput?.["No. of Chapters"] || "Not specified"}, Language: ${
      userCourseInput?.Language || "Not specified"
    } in JSON Format.`;
    const FINAL_PROMPT = BASIC_PROMPT + USER_INPUT_PROMPT;

    console.log("FINAL_PROMPT:", FINAL_PROMPT);
    setLoading(true);
    setLoadStatus("Structuring course layout outline...");

    const courseData = {
      name: userCourseInput?.topic || "Untitled Course",
      category: userCourseInput?.category || "General",
      topic: userCourseInput?.topic || "Unknown",
      level: userCourseInput?.Level || "Beginner",
      language: userCourseInput?.Language || "English",
      addVideo: userCourseInput?.["Add Video"] !== "No", // true by default, false only if user selects "No"
      createdby: user?.primaryEmailAddress?.emailAddress || "anonymous",
      username: user?.fullName || user?.firstName || "anonymous",
    };

    try {
      // Step 1: Generate Outline
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: FINAL_PROMPT }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate outline layout");
      }

      const outlineChapters = data.result?.chapters || [];
      const generatedChaptersList: any[] = [];

      // Step 2: Generate All Chapters Sequentially
      for (let i = 0; i < outlineChapters.length; i++) {
        const chapter = outlineChapters[i];
        const chapterName = chapter.chapterName || chapter.chapter_name || chapter.name || chapter["Chapter Name"] || `Chapter ${i + 1}`;
        setLoadStatus(`Generating content for Chapter ${i + 1}/${outlineChapters.length}: "${chapterName}"...`);

        // Get video details if enabled
        const addVideoParam = courseData.addVideo;

        // Call generate-chapter API in non-saving mock mode
        const chapterRes = await fetch("/api/generate-chapter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: "temp-outline-generation", // bypass DB update inside endpoint
            chapterIndex: i,
            chapterName,
            topic: courseData.topic,
            level: courseData.level,
            addVideo: addVideoParam,
          }),
        });

        const chapterData = await chapterRes.json();
        if (!chapterRes.ok) {
          throw new Error(chapterData.error || `Failed to generate content for "${chapterName}"`);
        }

        // Keep content loaded in memory
        generatedChaptersList.push({
          chapterIndex: i,
          content: chapterData.chapter?.content || chapterData.content,
          videoId: chapterData.chapter?.videoId || chapterData.videoId || "",
        });
      }

      // Step 3: Complete Generation successfully -> persist everything
      setLoadStatus("Saving course materials safely to database...");
      const saveRes = await fetch("/api/course/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseData,
          courseOutput: data.result,
          chapters: generatedChaptersList,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || "Failed to save final course package");
      }

      setLoading(false);
      router.push(`/course/${saveData.courseId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Synthesizing course failed");
      setLoading(false);
    }
  };


  const { theme } = useTheme();

  return (
    <div className={`flex flex-col items-center min-h-screen relative pb-24 transition-colors duration-200 ${theme === "dark" ? "dark bg-gray-950 text-white" : "bg-gray-50 text-gray-800"}`}>
      {/* Header */}
      <h2 className="text-4xl font-bold mt-16 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text text-transparent">
        Create a New Course
      </h2>
      <p className="text-gray-650 dark:text-gray-400 mt-2">Instantly generate your AI-powered course</p>

      {/* Stepper + Form Area */}
      <div className="mt-12 flex items-start gap-8 w-full max-w-5xl px-4 md:px-0">
        {/* Stepper */}
        <div className="flex flex-col items-start space-y-8">
          {stepperOptions.map((option, index) => (
            <div key={option.id} className="flex items-center">
              <div
                className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                  activeStep === index
                    ? "w-14 h-14 border-4 border-black dark:border-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-lg scale-110"
                    : "w-10 h-10 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white opacity-60"
                }`}
              >
                {option.icon}
              </div>
              <p className={`ml-4 font-bold text-sm transition-all ${activeStep === index ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                {option.name}
              </p>
            </div>
          ))}
        </div>

        {/* Step Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-2xl p-8 min-h-[300px] transition-colors">
          {activeStep === 0 ? <SelectCategory /> : activeStep === 1 ? <TopicDescription /> : <SelectOption />}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-8 flex justify-between items-center transition-colors z-40 shadow-lg">
        {activeStep > 0 ? (
          <Button onClick={handlePrev} variant="outline" className="border border-gray-400 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            Previous
          </Button>
        ) : (
          <div />
        )}

        {activeStep < stepperOptions.length - 1 ? (
          <Button onClick={handleNext} disabled={!canProceed} className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-medium hover:opacity-90">
            Next
          </Button>
        ) : (
          <Button disabled={!canProceed || loading} onClick={() => GenerateCourseLayout()} className="bg-black dark:bg-white dark:text-black text-white font-medium hover:bg-gray-900 dark:hover:bg-gray-150">
            {loading ? "Generating..." : "Generate Course Layout"}
          </Button>
        )}
      </div>
      <LoadingDialog open={loading} subtitle={loadStatus} />

      {/* Result / Error Display */}
      <div className="w-full max-w-5xl mt-6 px-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900 p-4 rounded-xl mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {generated && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 whitespace-pre-wrap transition-colors">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Generated Course (raw JSON)</h3>
            <pre className="text-sm text-gray-700 dark:text-gray-300">{generated}</pre>
          </div>
        )}
      </div>
      
    </div>

  );
}
