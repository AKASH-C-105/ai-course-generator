import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function Header() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex justify-between items-center w-full max-w-6xl px-6 py-3 bg-black/40 dark:bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
          <div className="bg-white rounded-full overflow-hidden flex items-center justify-center w-[120px] h-[40px] px-2">
            <Image src="/ai-logo.png" alt="Logo" width={100} height={30} className="object-contain" />
          </div>
          <Link href="/dashboard">
            <Button variant={'logo_color'} className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">Get Started</Button>
          </Link>
      </div>
    </header>
  )
}

export default Header