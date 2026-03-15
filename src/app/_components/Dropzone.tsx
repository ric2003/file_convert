"use client";

import React, { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export function Dropzone({ onFilesAdded }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const addedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (addedFiles.length > 0) {
        onFilesAdded(addedFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const addedFiles = Array.from(e.target.files);
      if (addedFiles.length > 0) {
        onFilesAdded(addedFiles);
      }
    }
    // Reset file input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-neutral-50/50 p-12 text-center transition-all duration-200 ease-in-out hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-800/50",
        isDragging
          ? "border-blue-500 bg-blue-50/50 shadow-inner dark:border-blue-500 dark:bg-blue-900/20"
          : "border-neutral-300 shadow-sm dark:border-neutral-700",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/png, image/jpeg, image/webp"
      />
      <div className="flex flex-col items-center gap-4 text-neutral-600 dark:text-neutral-400">
        <div
          className={cn(
            "rounded-full bg-white p-4 shadow-sm transition-transform duration-200 dark:bg-neutral-800",
            isDragging ? "scale-110 text-blue-500 dark:text-blue-400" : "text-neutral-400 dark:text-neutral-500",
          )}
        >
          <UploadCloud className="h-8 w-8" />
        </div>
        <div>
          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-200">
            Click to upload <span className="font-normal text-neutral-500 dark:text-neutral-400">or drag and drop</span>
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            PNG, JPG, JPEG, or WEBP (Max size: 50MB)
          </p>
        </div>
      </div>
    </div>
  );
}
