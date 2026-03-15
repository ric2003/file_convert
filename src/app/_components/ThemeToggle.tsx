"use client";

import * as React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="hidden sm:block h-9 w-9 rounded-lg border border-neutral-200 bg-transparent dark:border-neutral-800" />
    );
  }

  const options = [
    { id: "light", icon: Sun, label: "Light Mode" },
    { id: "system", icon: Laptop, label: "System Preference" },
    { id: "dark", icon: Moon, label: "Dark Mode" },
  ] as const;

  const currentTheme = theme || "system";
  const activeOption = options.find((o) => o.id === currentTheme) || options[1];
  const inactiveOptions = options.filter((o) => o.id !== currentTheme);
  const orderedOptions = [...inactiveOptions, activeOption];

  return (
    <div className="group relative hidden sm:flex h-9 items-center justify-end z-50">
      {/* Collapsed state (shows current theme) */}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 group-hover:opacity-0 group-hover:scale-95 duration-200 ease-out">
        <activeOption.icon className="h-4 w-4" />
      </div>

      {/* Expanded state on hover */}
      <div className="absolute right-0 top-0 flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 text-neutral-500 shadow-sm opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 origin-right scale-95 group-hover:scale-100">
        {orderedOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`rounded-md p-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              currentTheme === opt.id
                ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                : ""
            }`}
            title={opt.label}
          >
            <opt.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
