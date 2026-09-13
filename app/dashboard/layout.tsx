import React from "react";
import Sidebar from './_components/sidebar';
import Header from "./_components/Header";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/schema";
import { eq, sql } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  let courseCount = 0;

  if (email) {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(CourseList)
        .where(eq(CourseList.createdby, email));
      courseCount = Number(result[0]?.count || 0);
    } catch (e) {
      console.error("Failed to query user course count:", e);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      {/* Premium Fixed Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        
        {/* Futuristic Grid Overlay */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" 
          style={{ maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 100%)' }}
        />
      </div>

      {/* Sidebar (hidden on mobile for cleaner view) */}
      <div className="hidden md:block z-20">
        <Sidebar courseCount={courseCount} />
      </div>

      {/* Main content area */}
      <div className="md:ml-64 w-full transition-colors duration-200 z-10 relative">
        <Header />
        <div className="pt-24 p-8 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

