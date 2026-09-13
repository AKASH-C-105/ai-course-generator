"use client"
import React from 'react'
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AddCourse() {
    const {user} = useUser();
  return (
    <div>
        <div>
            <h2 className='text-2xl text-gray-900 dark:text-white'>HELLO, <span className='font-bold'>{user?.firstName}</span></h2>
            <p className='text-sm text-gray-500 dark:text-gray-400'>Create a new course in instant by AI</p>
        </div>
        <br></br>
        <Link href='/create-course'>
            <Button variant={'logo_color'}>+ Create Course</Button>
        </Link>
    </div>
  )
}

export default AddCourse