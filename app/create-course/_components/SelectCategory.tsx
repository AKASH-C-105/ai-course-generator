"use client";
import React, { useState, useContext, useEffect } from "react";
import CategoryList from "@/app/_shared/CategoryList";
import { UserInputContext } from "@/app/_context/UserInputContext";

function SelectCategory() {
  const userInputCtx = useContext(UserInputContext);

  // 🧠 Defensive check — helps debugging
  if (!userInputCtx) {
    console.error("UserInputContext not found — wrap with provider!");
    return null;
  }

  const { userCourseInput, setUserCourseInput } = userInputCtx;

  // 🟢 Use context value (persisted category) as default selection
  const [selected, setSelected] = useState<number | null>(null);

  // ✅ When the component mounts, restore the selection from context
  useEffect(() => {
    const matchedCategory = CategoryList.find(
      (item) => item.name === userCourseInput?.category
    );
    if (matchedCategory) {
      setSelected(matchedCategory.id);
    }
  }, [userCourseInput?.category]);

  // ✅ Update category and persist in context
  const handleCategoryChange = (category: string, id: number) => {
    setSelected(id);
    setUserCourseInput((prev) => ({
      ...prev,
      category,
    }));
  };

  return (
    <div className="text-gray-900 dark:text-white">
      <h3 className="text-lg font-bold">Select a Category</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
        {CategoryList.map((item) => (
          <div
            key={item.id}
            onClick={() => handleCategoryChange(item.name, item.id)}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md
              ${
                selected === item.id
                  ? "border-black dark:border-white scale-105 bg-gray-50 dark:bg-gray-800"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
              }`}
          >
            <div
              className={`text-3xl transition-transform duration-300 ${
                selected === item.id ? "scale-110 text-black dark:text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {item.icon}
            </div>
            <p
              className={`text-sm font-medium ${
                selected === item.id ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectCategory;
