"use client";
import React from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "@/app/_context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-40
        flex justify-between items-center
        bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm px-6 py-4
        md:ml-64 transition-all duration-300">
      <div className="dark:bg-black rounded-xl p-2 flex items-center justify-center shadow-none dark:shadow-md border border-transparent dark:border-white/10 transition-all">
        <Image
          src="/ai-logo-only.png"
          width={35}
          height={35}
          alt="Logo"
          className="object-contain dark:invert rounded mix-blend-multiply dark:mix-blend-normal"
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
