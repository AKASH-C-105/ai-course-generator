import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Minimal Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Very subtle ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md p-6">
        <Link href="/" className="mb-8">
          <div className="p-3 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-white/10 transition-transform hover:scale-105">
            <Image src="/ai-logo.jpg" width={140} height={50} alt="Logo" className="dark:invert object-contain rounded-xl mix-blend-multiply dark:mix-blend-normal" />
          </div>
        </Link>
        
        <SignIn appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-2xl border border-gray-100 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl w-full p-2",
            headerTitle: "text-gray-900 dark:text-white font-bold text-xl",
            headerSubtitle: "text-gray-500 dark:text-gray-400",
            formButtonPrimary: "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm transition-all font-medium rounded-xl",
            socialButtonsBlockButton: "border-gray-200 dark:border-white/10 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all rounded-xl",
            socialButtonsBlockButtonText: "font-medium",
            dividerLine: "bg-gray-200 dark:bg-white/10",
            dividerText: "text-gray-400 dark:text-gray-500 text-xs",
            formFieldLabel: "text-gray-700 dark:text-gray-300 font-medium text-sm",
            formFieldInput: "bg-white/50 dark:bg-black/20 border-gray-200 dark:border-white/10 dark:text-white focus:border-gray-900 dark:focus:border-white focus:ring-0 transition-colors rounded-xl",
            footerActionLink: "text-gray-900 dark:text-white hover:underline font-medium",
          }
        }} />
      </div>
    </div>
  );
}
