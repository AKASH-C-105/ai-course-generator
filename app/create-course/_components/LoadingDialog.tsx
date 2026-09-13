// LoadingDialog.tsx
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

export default function LoadingDialog({ open, subtitle = "Please wait." }: { open: boolean; subtitle?: string }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-white dark:bg-gray-900 border dark:border-gray-800">
        <AlertDialogHeader>
          {/* Required for accessibility. Hide visually if you don't want it shown */}
          <AlertDialogTitle className="sr-only">Loading</AlertDialogTitle>

          {/* Use asChild to make the Description render a div instead of a <p> */}
          <AlertDialogDescription asChild>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16">
                <Image
                  src="/loader.gif"       // leading slash required for public/
                  alt="Loading"
                  width={64}
                  height={64}
                  unoptimized             // helpful for GIFs
                />
              </div>

              {/* now you can use block layout freely inside this div */}
              <div className="text-center text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                Generating your course…  
                <br />
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-1 block">{subtitle}</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
