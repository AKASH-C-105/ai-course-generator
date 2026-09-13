"use client";
import React, { useContext } from "react";
import { UserInputContext } from "@/app/_context/UserInputContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SelectOption() {
  const context = useContext(UserInputContext);
  if (!context) throw new Error("❌ UserInputContext is not available");

  const { userCourseInput, setUserCourseInput } = context;

  // ✅ Handle input or select field changes
  const handleInputChange = (fieldName: string, value: string) => {
    setUserCourseInput((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <div className="px-10 md:px-20 lg:px-44 py-10 text-gray-900 dark:text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">

        {/* Difficulty Level */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Difficulty Level
          </label>
          <Select defaultValue={userCourseInput?.["Level"]} onValueChange={(value) => handleInputChange("Level", value)}>
            <SelectTrigger className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-pink-400">
              <SelectValue placeholder="Select difficulty level" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white">
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ✅ Language Selection */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Language</label>
          <Select
            defaultValue={userCourseInput?.["Language"]}
            onValueChange={(value) => handleInputChange("Language", value)}
          >
            <SelectTrigger className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-pink-400">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white">
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Tamil">Tamil</SelectItem>
              <SelectItem value="Telugu">Telugu</SelectItem>
              <SelectItem value="Malayalam">Malayalam</SelectItem>
              <SelectItem value="Kannada">Kannada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Duration */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Course Duration
          </label>
          <Select defaultValue={userCourseInput?.["Duration"]} onValueChange={(value) => handleInputChange("Duration", value)}>
            <SelectTrigger className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-pink-400">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white">
              <SelectItem value="1 hour">1 hour</SelectItem>
              <SelectItem value="2 hours">2 hours</SelectItem>
              <SelectItem value="more than 3 hours">More than 3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Video */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Add Video
          </label>
          <Select defaultValue={userCourseInput?.["Add Video"]} onValueChange={(value) => handleInputChange("Add Video", value)}>
            <SelectTrigger className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-pink-400">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white">
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Chapters */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            No. of Chapters
          </label>
          <Input
            defaultValue={userCourseInput?.["No. of Chapters"]}
            type="number"
            placeholder="e.g. 5"
            min={0}
            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-pink-400"
            onChange={(e) =>
              handleInputChange("No. of Chapters", e.target.value)
            }
          />
        </div>

      </div>
    </div>
  );
}
