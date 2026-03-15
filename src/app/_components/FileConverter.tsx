"use client";

import React, { useState } from "react";
import { Dropzone } from "./Dropzone";
import { convertImage, type TargetFormat } from "~/utils/convertImage";
import { CheckCircle2, ChevronDown, Download, FileImage, Loader2, Play, Trash2, XCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ImageFile {
  id: string;
  originalFile: File;
  status: "idle" | "converting" | "success" | "error";
  targetFormat: TargetFormat;
  convertedBlobUrl?: string;
  convertedFilename?: string;
  errorMessage?: string;
}

export function FileConverter() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState<TargetFormat>("png");

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFilesAdded = (newFiles: File[]) => {
    const initializedFiles: ImageFile[] = newFiles.map((file) => ({
      id: generateId(),
      originalFile: file,
      status: "idle",
      targetFormat: globalTargetFormat,
    }));
    setFiles((prev) => [...prev, ...initializedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFormatChange = (id: string, format: TargetFormat) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          // If the format changes, we should reset the converted state if it was successful
          return {
            ...f,
            targetFormat: format,
            status: f.status === "success" ? "idle" : f.status,
            convertedBlobUrl: undefined,
            convertedFilename: undefined,
          };
        }
        return f;
      }),
    );
  };

  const handleGlobalFormatChange = (format: TargetFormat) => {
    setGlobalTargetFormat(format);
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        targetFormat: format,
        status: f.status === "success" ? "idle" : f.status,
        convertedBlobUrl: undefined,
        convertedFilename: undefined,
      })),
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const convertSingleFile = async (id: string) => {
    const fileItem = files.find((f) => f.id === id);
    if (!fileItem) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "converting" } : f)),
    );

    try {
      const { url, filename } = await convertImage(
        fileItem.originalFile,
        fileItem.targetFormat,
      );
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "success",
                convertedBlobUrl: url,
                convertedFilename: filename,
              }
            : f,
        ),
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: "error", errorMessage: (error as Error).message }
            : f,
        ),
      );
    }
  };

  const convertAll = async () => {
    const idleFiles = files.filter((f) => f.status === "idle" || f.status === "error");
    for (const f of idleFiles) {
      await convertSingleFile(f.id);
    }
  };

  const clearAll = () => {
    setFiles([]);
  };

  const downloadAll = () => {
    const successFiles = files.filter((f) => f.status === "success" && f.convertedBlobUrl);
    successFiles.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.convertedBlobUrl!;
      a.download = file.convertedFilename ?? "converted-image";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <Dropzone onFilesAdded={handleFilesAdded} />

      {files.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
              Files ({files.length})
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Convert all to:
                </span>
                <div className="relative">
                  <select
                    value={globalTargetFormat}
                    onChange={(e) =>
                      handleGlobalFormatChange(e.target.value as TargetFormat)
                    }
                    className="appearance-none rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-3 pr-8 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-neutral-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WEBP</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -tranneutral-y-1/2 text-neutral-400 dark:text-neutral-500" />
                </div>
              </div>

              <div className="h-6 w-px bg-neutral-200 hidden sm:block dark:bg-neutral-700"></div>

              <button
                onClick={clearAll}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                Clear all
              </button>
              <button
                onClick={convertAll}
                disabled={!files.some((f) => f.status === "idle" || f.status === "error")}
                className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Play className="h-4 w-4" />
                Convert All
              </button>
              {files.some((f) => f.status === "success") && (
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center",
                  file.status === "error"
                    ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10"
                    : file.status === "success"
                      ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10"
                      : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:hover:border-neutral-600",
                )}
              >
                <div className="flex flex-1 items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    <FileImage className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-200">
                      {file.originalFile.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatBytes(file.originalFile.size)}
                    </p>
                    {file.status === "error" && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {file.errorMessage ?? "Conversion failed"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  {file.status === "idle" || file.status === "error" ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <select
                          value={file.targetFormat}
                          onChange={(e) =>
                            handleFormatChange(file.id, e.target.value as TargetFormat)
                          }
                          className="appearance-none rounded-md border border-neutral-200 bg-neutral-50 py-1.5 pl-3 pr-8 text-xs font-medium text-neutral-700 outline-none transition-colors hover:bg-neutral-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                          <option value="png">PNG</option>
                          <option value="jpeg">JPEG</option>
                          <option value="webp">WEBP</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -tranneutral-y-1/2 text-neutral-400 dark:text-neutral-500" />
                      </div>
                      <button
                        onClick={() => convertSingleFile(file.id)}
                        className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600"
                      >
                        Convert
                      </button>
                    </div>
                  ) : file.status === "converting" ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-medium">Converting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium hidden sm:inline">Done</span>
                      </div>
                      {file.convertedBlobUrl && (
                        <a
                          href={file.convertedBlobUrl}
                          download={file.convertedFilename ?? "converted-image"}
                          className="flex items-center gap-1.5 rounded-md bg-white border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => removeFile(file.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-red-400"
                    title="Remove file"
                  >
                    {file.status === "error" ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
