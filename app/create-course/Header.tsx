import React from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "@/app/_context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50
        flex justify-between items-center
        bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 shadow-sm px-6 py-3 transition-all duration-200">
      <div>
        <Image
          src="/ai-logo-only.png"
          width={45}
          height={45}
          alt="Logo"
          className="object-contain dark:invert"
        />
      </div>
      <div className="flex items-center gap-4">
        {/* Global theme switcher toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all text-xs shrink-0 cursor-pointer font-bold"
          title="Toggle Dark Mode"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
        <UserButton />
      </div>
    </header>
  );
}
