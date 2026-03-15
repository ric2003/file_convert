import { FileConverter } from "~/app/_components/FileConverter";
import { ThemeToggle } from "~/app/_components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 selection:bg-neutral-200 dark:bg-neutral-950 dark:text-neutral-100 dark:selection:bg-neutral-800">
      <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-20 pb-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center mt-8">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
            Image Converter
          </h1>
          <div className="flex flex-col items-center mx-auto max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">
            <p className="mt-4">
              Files processed purely client-side
            </p>
            <p>
              Convert your images effortlessly without them ever leaving your browser
            </p>
          </div>
        </div>

        <div className="w-full">
          <FileConverter />
        </div>
      </div>
    </main>
  );
}
