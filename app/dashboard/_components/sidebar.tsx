"use client"
import React from 'react'
import Image from 'next/image'
import { RiHome9Fill } from "react-icons/ri";
import { BiWorld } from "react-icons/bi";
import { FaSignOutAlt } from "react-icons/fa";
import { usePathname } from 'next/navigation';
import Link  from 'next/link';
import { Progress } from '@/components/ui/progress';
import { SignOutButton } from "@clerk/nextjs";

interface SidebarProps {
  courseCount?: number;
}

function Sidebar({ courseCount = 0 }: SidebarProps) {
    const Menu=[
        {
        id:1,
        name:'Home',
        icon:<RiHome9Fill />,
        path:'/dashboard'
    },
    {
        id:2,
        name:'Explore',
        icon:<BiWorld />,
        path:'/dashboard/explore'
    },
    {
      id:3,
        name:'Logout',
        icon:<FaSignOutAlt />,
        path:'/dashboard/logout'
    }
]
const path=usePathname();
const progressPercent = Math.min(100, (courseCount / 5) * 100);

  return (
    <div className="fixed h-full md:w-64 p-6 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-r border-gray-200 dark:border-white/5 transition-all duration-300">
      <div className="dark:bg-black rounded-2xl p-3 shadow-none dark:shadow-lg flex items-center justify-center mb-8 border border-transparent dark:border-white/10 transition-all">
        <Image src="/ai-logo.jpg" width={160} height={80} alt="Logo" className="dark:invert object-contain rounded-lg mix-blend-multiply dark:mix-blend-normal" />
      </div>

      <ul className="space-y-2">
        {Menu.map((item) => (
           <li key={item.id}>
            {item.name === 'Logout' ? (
              <SignOutButton redirectUrl="/">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 p-3 cursor-pointer 
                hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors duration-155"
                >
                  <div className="text-2xl">{item.icon}</div>
                  <h2 className="font-medium text-sm">{item.name}</h2>
                </div>
              </SignOutButton>
            ) : (
              <Link href={item.path} >
                <div className={`flex items-center gap-2 p-3 cursor-pointer rounded-lg transition-colors duration-155
                ${item.path == path 
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`} 
                >
                  <div className="text-2xl">{item.icon}</div>
                  <h2 className="font-medium text-sm">{item.name}</h2>
                </div>
              </Link>
            )}
          </li>
        ))}
      </ul>
      <div className='absolute bottom-10 w-[80%]'>
          <Progress value={progressPercent} />
          <h2 className='text-xs my-2 text-gray-800 dark:text-gray-200 font-semibold'>{courseCount} out of 5 courses</h2>
      </div>
    </div>
  );
}

export default Sidebar;